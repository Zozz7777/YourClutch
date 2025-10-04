<?php

namespace App\Http\Requests\Api\Warehouse;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
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

        $rules = [
            'name'    => 'required',
            'slug'    => 'required|unique:warehouses,slug',
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
