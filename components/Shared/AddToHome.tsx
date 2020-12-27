import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0',
        maxHeight: '75vh',
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
    padding: '1em',
    border: '1px solid #000',
    fontSize: '22px',
    backgroundColor: '#21313a',
    color: '#fff'
}

const bodyStyles = {
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    overflow: 'auto',
    maxHeight: '400px'
}

const footerStyles = {
    padding: '1em',
    border: '1px solid #000'
}

Modal.setAppElement('#__next');

const AddToHome = (props) => {
    const [modalIsOpen, setIsOpen] = useState(true);

    function handleGotItClick() {
        setIsOpen(false);
    }

    return (
        <div>
            <Modal
                style={customStyles}
                contentLabel="Add to Home Screen"
                isOpen={modalIsOpen}
            >
                <div id="add-to-home-header" style={headerStyles}>
                    Add to Home Screen
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
                <div id="add-to-home-footer" style={footerStyles}>

                    <button className="clickable my-button w-100"
                        onClick={handleGotItClick}
                        style={{
                            backgroundColor: '#54925e'
                        }}>
                        Got it!
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default AddToHome;