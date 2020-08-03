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
        backgroundColor: 'red'
    }
};

Modal.setAppElement('#__next');

const Confirm = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(props.isOpen);
    }, [props.isOpen]);

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        // subtitle.style.color = '#f00';
    }

    function handleConfirm() {
        setIsOpen(false);

        if(typeof(props.onConfirm) === 'function') {
            props.onConfirm();
        }
    }

    function closeModal() {
        setIsOpen(false);

        if(typeof(props.onClose) === 'function') {
            props.onClose();
        }
    }

    return (
        <div>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles} 
                contentLabel="Example Modal"
            >
                <div className="modal-wrapper">
                    <div className="modal-title">
                        Are you sure?
                    </div>
                    <div className="modal-body">
                        <div className="flex space-between">
                            <button className="clickable my-button" onClick={handleConfirm}>Yes</button>
                            <button className="clickable my-button" onClick={closeModal}>No</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Confirm;