import Admin from '../../common/layouts/Admin.vue';
import SetupAdminApp from "../views/SetupAdminApp.vue";

export default [
    {
        path: '/',
        component: Admin,
        children: [
            {
                path: '/admin/setup',
                component: SetupAdminApp,
                name: 'admin.setup_app.index',
                meta: {
                    requireAuth: true,
                    menuParent: "",
                    menuKey: route => "setup_company",
                }
            }
        ]
    }
]
