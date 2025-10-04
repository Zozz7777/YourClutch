<?php

namespace App\Observers;

use App\Models\FrontWebsiteSettings;
use App\Models\Warehouse;

class WarehouseObserver
{
    public function saving(Warehouse $warehouse)
    {
        $company = company();

        // Cannot put in creating, because saving is fired before creating. And we need company id for check bellow
        if ($company && !$company->is_global) {
            $warehouse->company_id = company()->id;
        }
    }

    public function created(Warehouse $warehouse)
    {
        // Front website settings
        $frontSetting = new FrontWebsiteSettings();
        $frontSetting->company_id = $warehouse->company_id;
        $frontSetting->warehouse_id = $warehouse->id;
        $frontSetting->featured_categories = [];
        $frontSetting->featured_products = [];
        $frontSetting->features_lists = [];
        $frontSetting->pages_widget = [];
        $frontSetting->contact_info_widget = [];
        $frontSetting->links_widget = [];
        $frontSetting->top_banners = [];
        $frontSetting->bottom_banners_1 = [];
        $frontSetting->bottom_banners_2 = [];
        $frontSetting->bottom_banners_3 = [];
        $frontSetting->save();
    }
}
