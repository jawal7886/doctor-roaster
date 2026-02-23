<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAvatar extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'filename',
        'original_name',
        'mime_type',
        'file_size',
        'storage_path',
        'base64_data',
        'storage_type',
    ];

    /**
     * Get the user that owns the avatar.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL or base64 data for the avatar.
     */
    public function getUrlAttribute()
    {
        if ($this->storage_type === 'base64' && $this->base64_data) {
            return $this->base64_data;
        }
        
        if ($this->storage_type === 'local') {
            return asset('storage/' . $this->storage_path);
        }
        
        // For S3 or Cloudinary, return the storage_path which should be a full URL
        return $this->storage_path;
    }
}
