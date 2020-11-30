import React from 'react';
import Link from 'next/link';

const TutorialPage = () => {

    return (
        <div>
            <h1>Groceries Tutorial</h1>
            <div className="tutorial-wrapper">
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Getting Started
                    </div>
                    <div className="tutorial-text">

                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-01.png" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorialPage;