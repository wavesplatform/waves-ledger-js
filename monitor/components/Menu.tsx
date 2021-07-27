import React from "react";

export class MenuComponent extends React.Component {
    render() {
        return (
            <ul className="menu">
                <li className="status">
                    Device status:<div className="device-status off"></div>
                </li>

                <li>
                    Init device: <button className="device-init">init</button>
                </li>

                <li>
                    Users: <button className="users-list-next">Get</button>
                </li>

                <li>
                    Test All : <button className="autotest">Run</button>
                </li>

                <li>
                    Proto Tx: <button className="proto-tx">Test</button>
                </li>

                <li>
                    Byte Tx: <button className="byte-tx">Test</button>
                </li>

                <li>
                    Proto order: <button className="proto-order">Test</button>
                </li>

                <li>
                    Byte order: <button className="byte-order">Test</button>
                </li>

                <li>
                    Request: <button className="request">Test</button>
                </li>

                <li>
                    Custom data: <button className="custom-data">Test</button>
                </li>

                <li>
                    Message: <button className="message">Test</button>
                </li>

                <li>
                    Hide users: <input type="checkbox" className="hide-selected" />
                </li>
                <li className="error hide">
                    <button>Error</button>
                    <pre className="error-text"></pre>
                </li>
                <li>
                    <button className="signer-init">init signer</button>
                </li>
                <li>
                    <button className="signer-sign">sign tx</button>
                </li>
            </ul>
        );
    }
}
