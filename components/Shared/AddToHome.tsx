import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { env } from '../../util/environment';
import { USER_API_ADD_TO_HOME_OK } from '../../util/constants';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -38%)',
        padding: '0',
        maxHeight: '70vh',
        maxWidth: '85vw',
        overflow: 'hidden',
        border: '0',
        borderRadius: '14px'
    },
    overlay: {
        backgroundColor: 'rgb(0, 0, 0, .5)'
    }
};

const headerStyles = {
    padding: '.5em',
    border: '1px solid #000',
    fontSize: '18px',
    backgroundColor: '#21313a',
    color: '#fff'
}

const bodyStyles = {
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    overflow: 'auto',
    maxHeight: '350px',
    textAlign: 'center'
}

const footerStyles = {
    padding: '1em',
    border: '1px solid #000'
}

Modal.setAppElement('#__next');

const apiUrl = env.apiUrl + 'user';

const AddToHome = (props) => {
    const [modalIsOpen, setIsOpen] = useState(true);

    async function handleGotItClick() {
        setIsOpen(false);

        const body = {
            method: USER_API_ADD_TO_HOME_OK
        };

        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }

    return (
        <div>
            <Modal
                style={customStyles}
                contentLabel="Add to Home Screen"
                isOpen={modalIsOpen}
            >
                <div id="add-to-home-header" className="flex space-between" style={headerStyles}>
                    <div style={{
                        width: '75%'
                    }}>
                        Add to Home Screen
                    </div>
                    <div style={{
                        width: '25%'
                    }}>
                        <button className="clickable my-button"
                            onClick={handleGotItClick}
                            style={{
                                backgroundColor: '#54925e'
                            }}>
                            OK!
                    </button>
                    </div>
                </div>
                <div id="add-to-home-body" style={bodyStyles}>
                    <div style={{
                        padding: '1em'
                    }}>
                        Follow these steps to add the Groceries app to your home screen for easy access.
                    </div>
                    <div>
                        <img src="/images/tutorial/add-to-home-iphone.png" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AddToHome;