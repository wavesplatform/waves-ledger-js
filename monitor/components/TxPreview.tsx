import React from "react";

export class TxPreviewComponent extends React.Component {
    render() {
        return (
            <div className="tx-preview-container hidden">
                <span className="gray">TxId: </span><span className="tx-preview-id"></span><br/>
                <textarea className="tx-preview-json" rows={5} />
            </div>
        );
    }
}
