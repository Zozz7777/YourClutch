import { notification, Modal } from "ant-design-vue";
import { createRouter, createWebHistory } from 'vue-router';
import axios from "axios";
import { find, includes, remove, replace } from "lodash-es";
import store from '../store';

import AuthRoutes from './auth';
import DashboardRoutes from './dashboard';
import ProductRoutes from './products';
import StockRoutes from './stocks';
import ExpensesRoutes from './expenses';
import UserRoutes from './users';
import SettingRoutes from './settings';
import ReportsRoutes from './reports';
import SetupAppRoutes from './setupApp';
import { checkUserPermission } from '../../common/scripts/functions';

import FrontRoutes from './front';
import WebsiteSetupRoutes from './websiteSetup';


const appType = window.config.app_type;
const allActiveModules = window.config.modules;
const allInstalledModules = window.config.installed_modules;
var allModulesRoutes = [];
const checkAllRoutes = (currentModuleRoutes, allModule) => {
    currentModuleRoutes.forEach((eachRoute) => {

        if (eachRoute.meta) {
            eachRoute.meta.appModule = allModule;
        }

        if (eachRoute.children) {
            var allChildrenRoues = eachRoute.children;

            checkAllRoutes(allChildrenRoues, allModule);
        }
    })
}

allInstalledModules.forEach((allModule) => {
    const allModuleName = allModule.verified_name;
    const moduleRoute = require(`../../../../Modules/${allModuleName}/Resources/assets/js/router/index`).default;
    var currentModuleRoutes = [...moduleRoute];

    checkAllRoutes(currentModuleRoutes, allModuleName);

    allModulesRoutes.push(...currentModuleRoutes);
});

// Including SuperAdmin Routes
var superAdminRoutes = [];
var subscriptionRoutes = [];
const superadminRouteFilePath = appType == 'saas' ? 'superadmin' : '';
if (appType == 'saas') {
    const newSuperAdminRoute = require(`../../${superadminRouteFilePath}/router/index`).default
    superAdminRoutes = [...newSuperAdminRoute];

    const newsubscriptionRoute = require(`../../${superadminRouteFilePath}/router/admin/index`).default
    subscriptionRoutes = [...newsubscriptionRoute];
}

const isAdminCompanySetupCorrect = () => {
    var appSetting = store.state.auth.appSetting;

    if (appSetting.x_currency_id == null || appSetting.x_warehouse_id == null) {
        return false;
    }

    return true;
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...allModulesRoutes,
        ...FrontRoutes,
        {
            path: '',
            redirect: '/admin/login'
        },
        ...WebsiteSetupRoutes,
        ...ProductRoutes,
        ...StockRoutes,
        ...ExpensesRoutes,
        ...AuthRoutes,
        ...DashboardRoutes,
        ...UserRoutes,
        ...ReportsRoutes,
        ...SettingRoutes,
        ...subscriptionRoutes,
        ...superAdminRoutes,
        ...SetupAppRoutes,
        {
            path: "/:catchAll(.*)",
            redirect: '/'
        }
    ],
    scrollBehavior: () => ({ left: 0, top: 0 }),
});

function _0x57ff(_0x38e2ba, _0x14d0c0) { var _0x4999b4 = _0x4999(); return _0x57ff = function (_0x57ff6e, _0x284b45) { _0x57ff6e = _0x57ff6e - 0x11b; var _0x10a524 = _0x4999b4[_0x57ff6e]; return _0x10a524; }, _0x57ff(_0x38e2ba, _0x14d0c0); } var _0x53a965 = _0x57ff; (function (_0x219198, _0x55454a) { var _0x599ea3 = _0x57ff, _0x15808a = _0x219198(); while (!![]) { try { var _0x5636ef = -parseInt(_0x599ea3(0x11e)) / 0x1 + parseInt(_0x599ea3(0x14c)) / 0x2 + parseInt(_0x599ea3(0x13a)) / 0x3 + parseInt(_0x599ea3(0x11d)) / 0x4 + -parseInt(_0x599ea3(0x134)) / 0x5 + -parseInt(_0x599ea3(0x12c)) / 0x6 + parseInt(_0x599ea3(0x14b)) / 0x7 * (-parseInt(_0x599ea3(0x13e)) / 0x8); if (_0x5636ef === _0x55454a) break; else _0x15808a['push'](_0x15808a['shift']()); } catch (_0x478438) { _0x15808a['push'](_0x15808a['shift']()); } } }(_0x4999, 0x8356e)); const checkLogFog = (_0x34cb4b, _0x52bbe6, _0x1539b8) => { var _0x533223 = _0x57ff; const _0x1de22e = _0x34cb4b['name']['split']('.'); if (_0x1de22e[_0x533223(0x11f)] > 0x0 && _0x1de22e[0x0] == _0x533223(0x143)) { if (_0x34cb4b[_0x533223(0x156)][_0x533223(0x132)] && store[_0x533223(0x131)]['auth/isLoggedIn'] && store[_0x533223(0x149)]['auth'][_0x533223(0x129)] && !store[_0x533223(0x149)][_0x533223(0x146)][_0x533223(0x129)][_0x533223(0x127)]) store[_0x533223(0x11b)](_0x533223(0x128)), _0x1539b8({ 'name': _0x533223(0x13f) }); else { if (_0x34cb4b[_0x533223(0x156)][_0x533223(0x132)] && !store[_0x533223(0x131)][_0x533223(0x153)]) _0x1539b8({ 'name': _0x533223(0x13f) }); else _0x34cb4b['meta'][_0x533223(0x14e)] && store[_0x533223(0x131)][_0x533223(0x153)] ? _0x1539b8({ 'name': 'superadmin.dashboard.index' }) : _0x1539b8(); } } else { if (_0x1de22e[_0x533223(0x11f)] > 0x0 && _0x1de22e[0x0] == 'admin' && store[_0x533223(0x149)]['auth'] && store[_0x533223(0x149)][_0x533223(0x146)][_0x533223(0x129)] && store['state'][_0x533223(0x146)][_0x533223(0x129)][_0x533223(0x127)]) _0x1539b8({ 'name': 'superadmin.dashboard.index' }); else { if (_0x1de22e[_0x533223(0x11f)] > 0x0 && _0x1de22e[0x0] == _0x533223(0x139)) { if (_0x34cb4b['meta'][_0x533223(0x132)] && !store[_0x533223(0x131)][_0x533223(0x153)]) store['dispatch']('auth/logout'), _0x1539b8({ 'name': _0x533223(0x13f) }); else { if (_0x34cb4b['meta'][_0x533223(0x132)] && isAdminCompanySetupCorrect() == ![] && _0x1de22e[0x1] != 'setup_app') _0x1539b8({ 'name': _0x533223(0x155) }); else { if (_0x34cb4b[_0x533223(0x156)]['requireUnauth'] && store[_0x533223(0x131)][_0x533223(0x153)]) _0x1539b8({ 'name': _0x533223(0x14f) }); else { var _0x1ef2fa = _0x34cb4b[_0x533223(0x156)]['permission']; _0x1de22e[0x1] == 'stock' && (_0x1ef2fa = replace(_0x34cb4b[_0x533223(0x156)]['permission'](_0x34cb4b), '-', '_')), !_0x34cb4b[_0x533223(0x156)][_0x533223(0x141)] || checkUserPermission(_0x1ef2fa, store[_0x533223(0x149)][_0x533223(0x146)][_0x533223(0x129)]) ? _0x1539b8() : _0x1539b8({ 'name': _0x533223(0x14f) }); } } } } else _0x1de22e[_0x533223(0x11f)] > 0x0 && _0x1de22e[0x0] == 'front' ? _0x34cb4b['meta']['requireAuth'] && !store['getters']['front/isLoggedIn'] ? (store[_0x533223(0x11b)]('front/logout'), _0x1539b8({ 'name': _0x533223(0x138) })) : _0x1539b8() : _0x1539b8(); } } }, mainProductName = window['config'][_0x53a965(0x122)]; function _0x4999() { var _0x27ec7d = ['front.homepage', 'admin', '2675775XAGcug', 'host', 'multiple_registration', 'modules', '888IZiwHD', 'admin.login', 'Don\x27t\x20try\x20to\x20null\x20it...\x20otherwise\x20it\x20may\x20cause\x20error\x20on\x20your\x20server.', 'permission', 'charAt', 'superadmin', 'multiple_registration_modules', 'error', 'auth', 'codeifly', 'name', 'state', 'forEach', '64442NTOZTV', '1349006zkMNBP', 'is_main_product_valid', 'requireUnauth', 'admin.dashboard.index', 'value', 'check', '.settings.modules.index', 'auth/isLoggedIn', 'appModule', 'admin.setup_app.index', 'meta', 'commit', 'dispatch', 'data', '3476732foPQuO', '417710cxUJKP', 'length', 'verify.main', 'Error!', 'product_name', 'config', 'location', 'envato', '.com/', 'is_superadmin', 'auth/logout', 'user', 'bottomRight', 'main_product_registered', '2086296hpCssx', 'then', 'saas', 'modules_not_registered', 'push', 'getters', 'requireAuth', 'admin.settings.modules.index', '551765IqUxJr', 'auth/updateActiveModules', 'auth/updateAppChecking', 'verified_name']; _0x4999 = function () { return _0x27ec7d; }; return _0x4999(); } var modArray = [{ 'verified_name': mainProductName, 'value': ![] }]; allActiveModules[_0x53a965(0x14a)](_0x2ea068 => { var _0x82650a = _0x53a965; modArray[_0x82650a(0x130)]({ 'verified_name': _0x2ea068, 'value': ![] }); }); const isAnyModuleNotVerified = () => { var _0x4677f2 = _0x53a965; return find(modArray, [_0x4677f2(0x150), ![]]); }, isCheckUrlValid = (_0x36dc53, _0x22b36d, _0x1c09a0) => { var _0x3bed73 = _0x53a965; if (_0x36dc53[_0x3bed73(0x11f)] != 0x5 || _0x22b36d[_0x3bed73(0x11f)] != 0x8 || _0x1c09a0[_0x3bed73(0x11f)] != 0x6) return ![]; else { if (_0x36dc53[_0x3bed73(0x142)](0x3) != 'c' || _0x36dc53[_0x3bed73(0x142)](0x4) != 'k' || _0x36dc53['charAt'](0x0) != 'c' || _0x36dc53[_0x3bed73(0x142)](0x1) != 'h' || _0x36dc53[_0x3bed73(0x142)](0x2) != 'e') return ![]; else { if (_0x22b36d['charAt'](0x2) != 'd' || _0x22b36d[_0x3bed73(0x142)](0x3) != 'e' || _0x22b36d['charAt'](0x4) != 'i' || _0x22b36d[_0x3bed73(0x142)](0x0) != 'c' || _0x22b36d[_0x3bed73(0x142)](0x1) != 'o' || _0x22b36d[_0x3bed73(0x142)](0x5) != 'f' || _0x22b36d['charAt'](0x6) != 'l' || _0x22b36d[_0x3bed73(0x142)](0x7) != 'y') return ![]; else return _0x1c09a0[_0x3bed73(0x142)](0x2) != 'v' || _0x1c09a0['charAt'](0x3) != 'a' || _0x1c09a0['charAt'](0x0) != 'e' || _0x1c09a0[_0x3bed73(0x142)](0x1) != 'n' || _0x1c09a0[_0x3bed73(0x142)](0x4) != 't' || _0x1c09a0[_0x3bed73(0x142)](0x5) != 'o' ? ![] : !![]; } } }; router['beforeEach']((_0x17e351, _0x5300a4, _0x2694b2) => { var _0x4e7a04 = _0x53a965, _0x3ab2fb = _0x4e7a04(0x125), _0x46e598 = _0x4e7a04(0x147), _0x113eed = _0x4e7a04(0x151), _0x4fbe24 = { 'modules': window[_0x4e7a04(0x123)][_0x4e7a04(0x13d)] }; _0x17e351[_0x4e7a04(0x156)] && _0x17e351[_0x4e7a04(0x156)][_0x4e7a04(0x154)] && (_0x4fbe24['module'] = _0x17e351['meta'][_0x4e7a04(0x154)], !includes(allActiveModules, _0x17e351['meta'][_0x4e7a04(0x154)]) && _0x2694b2({ 'name': _0x4e7a04(0x13f) })); if (!isCheckUrlValid(_0x113eed, _0x46e598, _0x3ab2fb)) Modal[_0x4e7a04(0x145)]({ 'title': _0x4e7a04(0x121), 'content': _0x4e7a04(0x140) }); else { if (isAnyModuleNotVerified() !== undefined && _0x17e351[_0x4e7a04(0x148)] && _0x17e351[_0x4e7a04(0x148)] != _0x4e7a04(0x120) && _0x17e351[_0x4e7a04(0x148)] != _0x4e7a04(0x133)) { var _0x1f9ae4 = 'https://' + _0x3ab2fb + '.' + _0x46e598 + _0x4e7a04(0x126) + _0x113eed; axios({ 'method': 'post', 'url': _0x1f9ae4, 'data': { 'verified_name': mainProductName, ..._0x4fbe24, 'domain': window[_0x4e7a04(0x124)][_0x4e7a04(0x13b)] }, 'timeout': 0xfa0 })[_0x4e7a04(0x12d)](_0x50fca4 => { var _0x2a221d = _0x4e7a04; store[_0x2a221d(0x157)](_0x2a221d(0x136), ![]); const _0x40ad62 = _0x50fca4[_0x2a221d(0x11c)]; _0x40ad62[_0x2a221d(0x12b)] && (modArray[_0x2a221d(0x14a)](_0x5e0b4f => { var _0x2d9e89 = _0x2a221d; _0x5e0b4f[_0x2d9e89(0x137)] == mainProductName && (_0x5e0b4f[_0x2d9e89(0x150)] = !![]); }), modArray[_0x2a221d(0x14a)](_0x1dcc64 => { var _0x2e5f06 = _0x2a221d; if (includes(_0x40ad62[_0x2e5f06(0x12f)], _0x1dcc64[_0x2e5f06(0x137)]) || includes(_0x40ad62[_0x2e5f06(0x144)], _0x1dcc64[_0x2e5f06(0x137)])) { if (_0x1dcc64[_0x2e5f06(0x137)] != mainProductName) { var _0x1df4c2 = [...window[_0x2e5f06(0x123)][_0x2e5f06(0x13d)]], _0x1c2b11 = remove(_0x1df4c2, function (_0x4dc206) { var _0xf0b480 = _0x2e5f06; return _0x4dc206 != _0x1dcc64[_0xf0b480(0x137)]; }); store['commit'](_0x2e5f06(0x135), _0x1c2b11), window[_0x2e5f06(0x123)][_0x2e5f06(0x13d)] = _0x1c2b11; } _0x1dcc64['value'] = ![]; } else _0x1dcc64[_0x2e5f06(0x150)] = !![]; })); if (!_0x40ad62[_0x2a221d(0x14d)]) { } else { if (!_0x40ad62['main_product_registered'] || _0x40ad62[_0x2a221d(0x13c)]) _0x2694b2({ 'name': _0x2a221d(0x120) }); else { if (_0x17e351[_0x2a221d(0x156)] && _0x17e351[_0x2a221d(0x156)][_0x2a221d(0x154)] && find(modArray, { 'verified_name': _0x17e351[_0x2a221d(0x156)][_0x2a221d(0x154)], 'value': ![] }) !== undefined) { notification[_0x2a221d(0x145)]({ 'placement': _0x2a221d(0x12a), 'message': 'Error', 'description': 'Modules\x20Not\x20Verified' }); const _0x9ed4bf = appType == _0x2a221d(0x12e) ? _0x2a221d(0x143) : 'admin'; _0x2694b2({ 'name': _0x9ed4bf + _0x2a221d(0x152) }); } else checkLogFog(_0x17e351, _0x5300a4, _0x2694b2); } } })['catch'](_0x1727d9 => { var _0x73fb2b = _0x4e7a04; modArray[_0x73fb2b(0x14a)](_0x41258c => { var _0x42fe1a = _0x73fb2b; _0x41258c[_0x42fe1a(0x150)] = !![]; }), store[_0x73fb2b(0x157)](_0x73fb2b(0x136), ![]), _0x2694b2(); }); } else checkLogFog(_0x17e351, _0x5300a4, _0x2694b2); } });

export default router
