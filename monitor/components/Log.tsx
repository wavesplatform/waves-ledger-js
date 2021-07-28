import React from "react";

export class LogComponent extends React.Component {
    render() {
        return (
            <div>
                <div className="signer-log-container">
                    <pre className="signer-log"></pre>
                </div>
                <div className="result-container">
                    <pre className="autotest-data"></pre>
                </div>
            </div>
        );
    }
}
