<?php

namespace App\Models;

use App\Casts\Hash;
use App\Models\BaseModel;
use App\Scopes\CompanyScope;
use Vinkla\Hashids\Facades\Hashids;

class OrderItem extends BaseModel
{
    protected $table = 'order_items';

    protected $default = ['xid'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $hidden = ['id', 'order_id', 'user_id', 'product_id', 'unit_id', 'tax_id'];

    protected $appends = ['xid', 'x_order_id', 'x_user_id', 'x_product_id', 'x_unit_id', 'x_tax_id'];

    protected $filterable = ['id', 'product_id'];

    protected $casts = [
        'user_id' => Hash::class . ':hash',
        'order_id' => Hash::class . ':hash',
        'product_id' => Hash::class . ':hash',
        'unit_id' => Hash::class . ':hash',
        'tax_id' => Hash::class . ':hash',
    ];

    protected static function boot()
    {
        parent::boot();
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id');
    }

    // Start - Hashable Getter Functions
    public function getXUserIdAttribute()
    {
        $value = $this->user_id;

        if ($value) {
            $value = Hashids::encode($value);
        }

        return $value;
    }

    public function getXOrderIdAttribute()
    {
        $value = $this->order_id;

        if ($value) {
            $value = Hashids::encode($value);
        }

        return $value;
    }

    public function getXProductIdAttribute()
    {
        $value = $this->product_id;

        if ($value) {
            $value = Hashids::encode($value);
        }

        return $value;
    }

    public function getXUnitIdAttribute()
    {
        $value = $this->unit_id;

        if ($value) {
            $value = Hashids::encode($value);
        }

        return $value;
    }

    public function getXTaxIdAttribute()
    {
        $value = $this->tax_id;

        if ($value) {
            $value = Hashids::encode($value);
        }

        return $value;
    }

    // End - Hashable Getter Functions
}
