import React from "react";
import {
    AutotestLogComponent,
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
                <AutotestLogComponent />
            </React.Fragment>
        );
    }
}
