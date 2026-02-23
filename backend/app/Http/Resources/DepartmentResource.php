<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
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
            'description' => $this->description,
            'headId' => $this->head_id,
            'maxHoursPerDoctor' => $this->max_hours_per_doctor,
            'doctorCount' => $this->actual_doctor_count, // Use dynamic count instead of static field
            'color' => $this->color,
            'isActive' => $this->is_active,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'head' => $this->whenLoaded('head', function () {
                return new UserResource($this->head);
            }),
        ];
    }
}
