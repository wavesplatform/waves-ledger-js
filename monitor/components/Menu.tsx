import React from "react";

export class MenuComponent extends React.Component {
    render() {
        return (
            <div className="header">
                <div className="device-panel">
                    <div className="status">
                        Status:<div className="device-status off"></div>
                    </div>
                    <div>
                        Device:&nbsp;<button className="device-init">init</button>
                    </div>
                    <div>
                        Users:&nbsp;<button className="users-list-next">Get</button>
                    </div>
                    <div>
                        Hide:&nbsp;<input type="checkbox" className="hide-selected" />
                    </div>
                    <div className="error hide">
                        <button>Error</button>
                        <pre className="error-text"></pre>
                    </div>
                </div>
                <div className="tests-panel">
                    <div>
                        Test All:&nbsp;<button className="autotest">Run</button>
                    </div>

                    <div>
                        Proto Tx:&nbsp;<button className="proto-tx">Test</button>
                    </div>

                    <div>
                        Byte Tx:&nbsp;<button className="byte-tx">Test</button>
                    </div>

                    <div>
                        Proto order:&nbsp;<button className="proto-order">Test</button>
                    </div>

                    <div>
                        Byte order:&nbsp;<button className="byte-order">Test</button>
                    </div>

                    <div>
                        Request:&nbsp;<button className="request">Test</button>
                    </div>

                    <div>
                        Custom data:&nbsp;<button className="custom-data">Test</button>
                    </div>

                    <div>
                        Message:&nbsp;<button className="message">Test</button>
                    </div>
                </div>
                <div className="signer-panel">
                    <div>
                        <button className="signer-init">Init signer</button>
                    </div>
                    <div>
                        <button className="signer-sign">Sign tx</button>
                    </div>
                    <div>
                        Tx:&nbsp;<select className="tx-list" />
                    </div>
                </div>
            </div>
        );
    }
}
