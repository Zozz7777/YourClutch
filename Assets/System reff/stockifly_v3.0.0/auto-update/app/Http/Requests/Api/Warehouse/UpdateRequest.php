<?php

namespace App\Http\Requests\Api\Warehouse;

use Vinkla\Hashids\Facades\Hashids;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */

    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $convertedId = Hashids::decode($this->route('warehouse'));
        $id = $convertedId[0];

        $rules = [
            'name'    => 'required',
            'slug' => 'required|unique:warehouses,slug,' . $id,
            'email'    => 'required|email',
            'phone'    => 'required|integer',
            'default_pos_order_status'    => 'required',
            'customers_visibility'    => 'required',
            'suppliers_visibility'    => 'required',
            'products_visibility'    => 'required',
        ];

        return $rules;
    }
}
