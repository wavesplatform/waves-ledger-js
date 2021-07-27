import React from "react";

export class AutotestLogComponent extends React.Component {
    render() {
        return (
            <div className="result-container">
                Result:
                <br/>
                <pre className="autotest-data"></pre>
            </div>
        );
    }
}
