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
        maxHeight: '700px',
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
    border: '1px solid #000'
}

const bodyStyles = {
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    overflow: 'auto',
    maxHeight: '500px'
}

const footerStyles = {
    padding: '1em',
    border: '1px solid #000'
}

Modal.setAppElement('#__next');

const AddToHome = (props) => {
    return (
        <div>
            <Modal
                style={customStyles}
                contentLabel="Add to Home Screen"
                isOpen={true}
            >
                <div id="add-to-home-header" style={headerStyles}>
                    Add to Home Screen
                </div>
                <div id="add-to-home-body" style={bodyStyles}>
                    <div>
                        <img src="/images/tutorial/add-to-home-iphone.png" />
                    </div>
                </div>
                <div id="add-to-home-footer" style={footerStyles}>
                    Footer
                </div>
            </Modal>
        </div>
    );
}

export default AddToHome;