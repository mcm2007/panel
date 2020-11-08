import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@/state';
import DashboardRouter from '@/routers/DashboardRouter';
import ServerRouter from '@/routers/ServerRouter';
import AuthenticationRouter from '@/routers/AuthenticationRouter';
import { Provider } from 'react-redux';
import { SiteSettings } from '@/state/settings';
import ProgressBar from '@/components/elements/ProgressBar';
import NotFound from '@/components/screens/NotFound';
import tw from 'twin.macro';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';

interface ExtendedWindow extends Window {
    SiteConfiguration?: SiteSettings;
    PterodactylUser?: {
        uuid: string;
        username: string;
        email: string;
        /* eslint-disable camelcase */
        root_admin: boolean;
        use_totp: boolean;
        language: string;
        updated_at: string;
        created_at: string;
        /* eslint-enable camelcase */
    };
}

const Pageview = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        ReactGA.pageview(pathname);
    }, [ pathname ]);

    return null;
};

const App = () => {
    const { PterodactylUser, SiteConfiguration } = (window as ExtendedWindow);
    if (PterodactylUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: PterodactylUser.uuid,
            username: PterodactylUser.username,
            email: PterodactylUser.email,
            language: PterodactylUser.language,
            rootAdmin: PterodactylUser.root_admin,
            useTotp: PterodactylUser.use_totp,
            createdAt: new Date(PterodactylUser.created_at),
            updatedAt: new Date(PterodactylUser.updated_at),
        });
    }

    if (!store.getState().settings.data) {
        store.getActions().settings.setSettings(SiteConfiguration!);
    }

    useEffect(() => {
        if (SiteConfiguration?.analytics) {
            ReactGA.initialize(SiteConfiguration!.analytics);
        }
    }, []);

    return (
        <>
            <GlobalStylesheet/>
            <StoreProvider store={store}>
                <Provider store={store}>
                    <ProgressBar/>
                    <div css={tw`mx-auto w-auto`}>
                        <BrowserRouter basename={'/'} key={'root-router'}>
                            {SiteConfiguration?.analytics && <Pageview/>}
                            <Switch>
                                <Route path="/server/:id" component={ServerRouter}/>
                                <Route path="/auth" component={AuthenticationRouter}/>
                                <Route path="/" component={DashboardRouter}/>
                                <Route path={'*'} component={NotFound}/>
                            </Switch>
                        </BrowserRouter>
                    </div>
                </Provider>
            </StoreProvider>
        </>
    );
};

export default hot(App);
