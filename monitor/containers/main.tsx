import React from "react";
import {
    LogComponent,
    MenuComponent,
    TxPreviewComponent,
    UserListComponent
} from "../components";

interface IMainContainerProps {}
interface IMainContainerState {}

export default class MainContainer extends React.Component<IMainContainerProps, IMainContainerState> {
    render() {
        return (
            <React.Fragment>
                <MenuComponent />
                <UserListComponent />
                <TxPreviewComponent />
                <LogComponent />
            </React.Fragment>
        );
    }
}
