<?php

namespace App\Models;

use App\Classes\Common;
use Illuminate\Notifications\Notifiable;
use App\Models\BaseModel;
use App\Scopes\CompanyScope;

class Warehouse extends BaseModel
{
    use Notifiable;

    protected $table = 'warehouses';

    protected $default = ['xid', 'name', 'slug', 'logo', 'logo_url', 'dark_logo', 'dark_logo_url', 'online_store_enabled'];

    protected $guarded = ['id', 'users', 'created_at', 'updated_at'];

    protected $hidden = ['id'];

    protected $appends = ['xid', 'logo_url', 'dark_logo_url', 'signature_url'];

    protected $filterable = ['id', 'name', 'email', 'phone', 'city', 'country', 'zipcode'];

    protected $casts = [
        'show_email_on_invoice' => 'integer',
        'show_phone_on_invoice' => 'integer',
        'online_store_enabled' => 'integer',
        'is_default' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new CompanyScope);
    }

    public function getLogoUrlAttribute()
    {
        $warehouseLogoPath = Common::getFolderPath('warehouseLogoPath');

        return $this->logo == null ? asset('images/warehouse.png') : Common::getFileUrl($warehouseLogoPath, $this->logo);
    }

    public function getDarkLogoUrlAttribute()
    {
        $warehouseLogoPath = Common::getFolderPath('warehouseLogoPath');

        return $this->dark_logo == null ? asset('images/warehouse_dark.png') : Common::getFileUrl($warehouseLogoPath, $this->dark_logo);
    }

    public function getSignatureUrlAttribute()
    {
        $warehouseLogoPath = Common::getFolderPath('warehouseLogoPath');

        return $this->signature == null ? null : Common::getFileUrl($warehouseLogoPath, $this->signature);
    }

    public function users()
    {
        return $this->belongsToMany(StaffMember::class);
    }
}
