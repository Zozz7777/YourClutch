<?php

namespace App\Models;

use App\Casts\Hash;
use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserDetails extends BaseModel
{
    use HasFactory;

    protected $table = 'user_details';

    protected $default = ['xid'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $hidden = ['id', 'warehouse_id', 'user_id'];

    protected $appends = ['xid', 'x_warehouse_id', 'x_user_id'];

    protected $filterable = ['id'];

    protected $hashableGetterFunctions = [
        'getXWarehouseIdAttribute' => 'warehouse_id',
        'getXUserIdAttribute' => 'user_id',
    ];

    protected $casts = [
        'warehouse_id' => Hash::class . ':hash',
        'user_id' => Hash::class . ':hash',
    ];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('current_warehouse', function (Builder $builder) {
            $warehouse = warehouse();

            if ($warehouse) {
                $builder->where('user_details.warehouse_id', $warehouse->id);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(StaffMember::class)->withoutGlobalScopes();
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
