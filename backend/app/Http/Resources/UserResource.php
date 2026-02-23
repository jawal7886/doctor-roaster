<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role ? $this->role->name : null,
            'roleId' => $this->role_id,
            'roleDisplay' => $this->role ? $this->role->display_name : null,
            'specialty' => $this->specialty ? $this->specialty->name : null,
            'specialtyId' => $this->specialty_id,
            'departmentId' => $this->department_id,
            'status' => $this->status,
            'avatar' => $this->avatar_url ?? $this->avatar, // Use avatar_url accessor first, fallback to avatar column
            'joinDate' => $this->join_date,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'department' => $this->whenLoaded('department', function () {
                return new DepartmentResource($this->department);
            }),
        ];
    }
}
