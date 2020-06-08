import React, { useRef, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';
import { env } from '../util/environment';
import Link from 'next/link';

const loginApiUrl = env.apiUrl + 'user/login';
const signUpApiUrl = env.apiUrl + 'user/signup';

const Login = () => {
    const [valid, setValid] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [signUpFlow, setSignUpFlow] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    async function handleLogin() {
        if (!valid) {
            return;
        }

        setValid(false);
        setError(false);

        const resp = await fetch(loginApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'email': emailRef.current.value,
                'password': passwordRef.current.value
            })
        })

        const json = await resp.json();

        if (resp.status === 401) {
            setError(true);
            handleInputChange();
        } else {
            Router.replace('/securedData');
        }
    }

    async function handleSignUp() {
        if (!valid) {
            return;
        }

        setValid(false);
        setError(false);

        const resp = await fetch(signUpApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': nameRef.current.value,
                'email': emailRef.current.value,
                'password': passwordRef.current.value
            })
        })

        const json = await resp.json();

        console.log(json);

        if (resp.status !== 200) {
            setError(true);
            setErrorMessage(json.status);
        } else {
            await handleLogin();
        }
    }

    function buttonClass() {
        let btnClass = 'my-button'

        if (!valid) {
            btnClass += ' inactive';
        }

        return btnClass;
    }

    function handleInputChange() {
        const name = nameRef?.current?.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        if (!signUpFlow) {
            if (email && email.trim().length > 0 && password && password.trim().length > 0) {
                setValid(true);
            } else {
                setValid(false);
            }
        } else {
            if (name && name.trim().length > 0 && email && email.trim().length > 0 && password && password.trim().length > 0) {
                setValid(true);
            } else {
                setValid(false);
            }
        }
    }

    function errorMessageHTML() {
        if (!error) {
            return null;
        }

        let msg = !errorMessage ? 'Please enter a valid username and password.' : errorMessage;

        return <div className="error-text mb-20">{msg}</div>;
    }

    function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            if (!signUpFlow) {
                handleLogin();
            } else {
                handleSignUp();
            }
        }
    }

    function handleSignUpToggle(e) {
        e.stopPropagation();

        setSignUpFlow(!signUpFlow);
    }

    function titleMessage() {
        if (!signUpFlow) {
            return "Log in to your account";
        } else {
            return "Sign up for an account";
        }
    }

    return (
        <div className="site-wrapper">
            <div className="login-wrapper">
                <div className="login-top"></div>
                <div className="login-left">
                    <div className="login-left-wrapper">
                        <h1>{titleMessage()}</h1>
                        <div className="login-form">
                            {errorMessageHTML()}
                            {signUpFlow && <div className="login-form-fieldset">
                                <div className="login-form-label">
                                    Name
                            </div>
                                <div className="login-form-input">
                                    <input type="text" ref={nameRef} onChange={handleInputChange} />
                                </div>
                            </div>}
                            <div className="login-form-fieldset">
                                <div className="login-form-label">
                                    Email Address
                            </div>
                                <div className="login-form-input">
                                    <input type="text" ref={emailRef} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="login-form-fieldset">
                                <div className="login-form-label">
                                    Password
                            </div>
                                <div className="login-form-input">
                                    <input type="password" ref={passwordRef} onChange={handleInputChange} onKeyUp={handleKeyUp} />
                                </div>
                            </div>
                            {!signUpFlow && <div className="login-button-wrapper">
                                <div>
                                    <button type="submit" className={buttonClass()} onClick={handleLogin}>Login</button>
                                </div>
                                <div className="sign-up">
                                    Don't have an account? <a href="#" onClick={handleSignUpToggle}>Sign Up</a>
                                </div>
                            </div>}
                            {signUpFlow && <div className="login-button-wrapper">
                                <div>
                                    <button type="submit" className={buttonClass()} onClick={handleSignUp}>Sign Up</button>
                                </div>
                                <div className="sign-up">
                                    Have an account? <a href="#" onClick={handleSignUpToggle}>Sign In</a>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="login-right">
                    <div className="login-right-container">
                        <div className="login-right-title">
                            <div className="title">
                                GROCER
                        </div>
                            <div className="tag-line">
                                Shop smarter.
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;