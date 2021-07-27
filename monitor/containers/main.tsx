import React from "react";
import {
    AutotestLogComponent,
    MenuComponent,
    UserListComponent
} from "../components";

interface IMainContainerProps {}
interface IMainContainerState {}

export default class MainContainer extends React.Component<IMainContainerProps, IMainContainerState> {
    render() {
        return (
            <React.Fragment>
                <MenuComponent />
                <br />
                <UserListComponent />
                <AutotestLogComponent />
            </React.Fragment>
        );
    }
}
