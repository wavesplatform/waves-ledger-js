import React from "react";
import ReactDOM from "react-dom";
import Main from "./containers/main";
import { main } from './main';

ReactDOM.render(
    React.createElement(Main),
    document.querySelector(".main_container"),
    () => {
        main();
    }
);


