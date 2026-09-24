import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { NavBar } from '../components/NavBar';


export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {

    return (
        <React.Fragment>
            <NavBar />
            <div>Hello "__root"!</div>
            <Outlet />
        </React.Fragment>
    )
}