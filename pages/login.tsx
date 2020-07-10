import React, { useRef, useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import Router, { useRouter } from 'next/router';
import { env } from '../util/environment';
import { LOCAL_STORAGE_USER, CHECK_ACTIVATION_CODE_API_METHOD } from '../util/constants';
import { myGet } from '../util/myGet';
import getUser from '../util/getUser';

const userApiUrl = env.apiUrl + 'user';
//const signUpEnabled = env.apiUrl.indexOf('localhost') > -1;

const Login = () => {
    const [valid, setValid] = useState(false);
    const [validActivation, setValidActivation] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [step, setStep] = useState(1);
    const [signUpFlow, setSignUpFlow] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const [showActivation, setShowActivation] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const router = useRouter();

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const actCodeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = getUser();
        let isCancelled = false;

        if (user) {
            router.push('/grocery-list');

            setTimeout(() => {
                if (!isCancelled) {
                    setCheckingAuth(false);

                    setTimeout(() => {
                        emailRef.current.focus();
                    }, 100);
                }
            }, 2000);
        } else {
            setCheckingAuth(false);

            setTimeout(() => {
                emailRef.current.focus();
            }, 100);
        }

        return () => {
            isCancelled = true;
        };
    }, []);

    async function handleLogin() {
        if (!valid) {
            return;
        }

        setSigningIn(true);
        setValid(false);
        setError(false);

        const resp = await fetch(userApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'method': 'login',
                'email': emailRef.current.value,
                'password': passwordRef.current.value
            })
        })

        const json = await resp.json();
        localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(json));
        setSigningIn(false);

        if (resp.status === 401) {
            setError(true);
            handleInputChange();
        } else {
            Router.replace('/grocery-list');
        }
    }

    async function handleSignUp() {
        if (!valid) {
            return;
        }

        setValid(false);
        setError(false);

        const resp = await fetch(userApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'method': 'signup',
                'name': nameRef.current.value,
                'email': emailRef.current.value,
                'password': passwordRef.current.value
            })
        })

        const json = await resp.json();

        if (resp.status !== 200) {
            setError(true);
            setErrorMessage(json.status);
        } else {
            await handleLogin();
        }
    }

    function buttonClass() {
        let btnClass = 'my-button w-100'

        if (!valid) {
            btnClass += ' inactive';
        }

        return btnClass;
    }

    function handleInputChange() {
        const name = nameRef?.current?.value;
        const email = emailRef.current.value;
        const password = passwordRef?.current?.value;

        if (!signUpFlow) {
            if (step == 1) {
                if (email && email.trim().length > 0) {
                    setValid(true);
                } else {
                    setValid(false);
                }
            } else if (step == 2) {
                if (email && email.trim().length > 0 && password && password.trim().length > 0) {
                    setValid(true);
                } else {
                    setValid(false);
                }
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

    function handleEmailKeyUp(e) {
        if (e.key.toLowerCase() === 'enter' && valid) {
            setStep(2);
            setValid(false);

            setTimeout(() => {
                passwordRef.current?.focus();
            }, 100);
            
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

    function activationButtonClass() {
        let btnClass = 'my-button w-100'

        if (!validActivation) {
            btnClass += ' inactive';
        }

        return btnClass;
    }

    function handleActCodeChange() {
        const code = actCodeRef?.current?.value;

        if (code && code.trim().length > 0) {
            setValidActivation(true);
        } else {
            setValidActivation(false);
        }
    }

    async function handleActivationCheck() {
        if (!validActivation) {
            return;
        }

        const result = await myGet(userApiUrl + '?method=' + CHECK_ACTIVATION_CODE_API_METHOD + '&code=' + actCodeRef?.current?.value, null);

        if (result && result.valid) {
            setError(false);
            setValid(false);
            setStep(2);
            setErrorMessage('');
            setValidActivation(false);
            setShowActivation(false);
            setShowSignUp(false);
            setSignUpFlow(true);
        } else {
            setError(true);
            setErrorMessage('Invalid code');
        }
    }

    function cancelActivation() {
        setShowActivation(false);
        setErrorMessage('');
        setError(false);
    }

    async function handleActivationKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await handleActivationCheck();
        }
    }

    return (
        <div className="site-wrapper">
            <div className="login-wrapper">
                <div className="login-top">
                </div>
                {!checkingAuth && <div className="login-left">
                    <div className="login-left-wrapper">
                        <div className="flex">
                            <div className="mr-20">
                                <img src="/images/cart-icon-blue-gray.png" width="50" />
                            </div>
                            <div>
                                <h1>Groceries</h1>
                            </div>
                        </div>
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
                            {!showActivation && <div className="login-form-fieldset">
                                <div className="login-form-label">
                                    Email Address
                                </div>
                                <div className="login-form-input">
                                    <input type="email" ref={emailRef} onChange={handleInputChange} onKeyUp={handleEmailKeyUp} />
                                </div>
                            </div>}
                            {!showActivation && step == 2 && <div className="login-form-fieldset">
                                <div className="login-form-label">
                                    Password
                                </div>
                                <div className="login-form-input">
                                    <input type="password" ref={passwordRef} onChange={handleInputChange} onKeyUp={handleKeyUp} />
                                </div>
                            </div>}
                            {!signUpFlow && !showActivation && step == 2 && <div className="login-button-wrapper">
                                <div className="w-100">
                                    <button type="submit" className={buttonClass()} onClick={handleLogin}>Login</button>
                                </div>
                                {showSignUp && <div className="sign-up">
                                    Don't have an account? <a href="#" onClick={handleSignUpToggle}>Sign Up</a>
                                </div>}
                            </div>}
                            {!signUpFlow && !showActivation && step == 1 && <div className="login-button-wrapper">
                                <div className="w-100">
                                    <button type="submit" className={buttonClass()} onClick={() => setStep(2)}>Next</button>
                                </div>
                                {showSignUp && <div className="sign-up">
                                    Don't have an account? <a href="#" onClick={handleSignUpToggle}>Sign Up</a>
                                </div>}
                            </div>}
                            {signUpFlow && <div className="">
                                <div className="w-100">
                                    <button type="submit" className={buttonClass()} onClick={handleSignUp}>Sign Up</button>
                                </div>
                                <div className="sign-up mt-20 text-center">
                                    Have an account? <a href="#" onClick={handleSignUpToggle}>Sign In</a>
                                </div>
                            </div>}
                            {!showActivation && !signUpFlow && !showSignUp && <div className="mt-20">
                                <div className="sign-up">
                                    Have an activation code? <a href="#" onClick={() => setShowActivation(true)}>Click Here</a>
                                </div>
                            </div>}
                            {showActivation && <div>
                                <div className="mt-20">
                                    <div className="login-form-fieldset">
                                        <div className="login-form-label">
                                            Activation Code
                                        </div>
                                        <div className="login-form-input">
                                            <input type="text" autoCapitalize="none" ref={actCodeRef} onChange={handleActCodeChange} onKeyUp={handleActivationKeyUp} />
                                        </div>
                                        <div className="mt-20">
                                            <button type="submit" className={activationButtonClass()} onClick={handleActivationCheck}>Confirm Activation Code</button>
                                        </div>
                                        <div className="mt-20 text-center">
                                            <a href="#" onClick={cancelActivation}>Cancel</a>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>}
                {checkingAuth && <div className="mt-20 checking-auth">
                    Checking authentication.  Please wait.
                </div>}
                <div className="login-right">
                    <div className="login-right-container">
                        <div className="login-right-title">
                            <div className="title">
                                GROCERIES
                            </div>
                            <div className="tag-line">
                                Shop smarter.
                            </div>
                        </div>
                    </div>
                    <div className="logo">
                        <img src="/images/cart-icon-white.png" width="300" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;