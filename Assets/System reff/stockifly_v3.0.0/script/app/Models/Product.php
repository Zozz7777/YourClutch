<?php

namespace App\Models;

use App\Casts\Hash;
use App\Classes\Common;
use App\Models\BaseModel;
use App\Scopes\CompanyScope;
use Vinkla\Hashids\Facades\Hashids;

class Product extends BaseModel
{
    protected $table = 'products';

    protected $default = ['xid'];

    protected $guarded = ['id', 'user_id', 'created_at', 'updated_at'];

    protected $hidden = ['id', 'category_id', 'brand_id', 'unit_id', 'user_id'];

    protected $appends = ['xid', 'x_category_id', 'x_brand_id', 'x_unit_id', 'x_user_id', 'image_url'];

    protected $filterable = ['id', 'products.id', 'products.name', 'name', 'category_id', 'brand_id'];

    protected $hashableGetterFunctions = [
        'getXCategoryIdAttribute' => 'category_id',
        'getXBrandIdAttribute' => 'brand_id',
        'getXUnitIdAttribute' => 'unit_id',
        'getXUserIdAttribute' => 'user_id',
    ];

    protected $casts = [
        'category_id' => Hash::class . ':hash',
        'brand_id' => Hash::class . ':hash',
        'unit_id' => Hash::class . ':hash',
        'user_id' => Hash::class . ':hash',
    ];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new CompanyScope);
    }

    public function getImageUrlAttribute()
    {
        $productImagePath = Common::getFolderPath('productImagePath');

        return $this->image == null ? asset('images/product.png') : Common::getFileUrl($productImagePath, $this->image);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id', 'id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(StaffMember::class, 'user_id', 'id');
    }

    public function warehouseStocks()
    {
        return $this->hasMany(WarehouseStock::class, 'product_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'id');
    }

    public function stockHistory()
    {
        return $this->hasMany(StockHistory::class, 'product_id', 'id');
    }

    public function customFields()
    {
        return $this->hasMany(ProductCustomField::class, 'product_id', 'id');
    }

    public function details()
    {
        return $this->belongsTo(ProductDetails::class, 'id', 'product_id');
    }
}
