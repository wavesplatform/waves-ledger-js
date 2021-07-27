import React from "react";

export class TxPreviewComponent extends React.Component {
    render() {
        return (
            <div className="tx-preview-container hidden">
                <textarea className="tx-preview-json" rows={5} />
            </div>
        );
    }
}
