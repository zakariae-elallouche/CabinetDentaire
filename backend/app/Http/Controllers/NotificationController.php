<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('utilisateur_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($notifications);
    }

    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('utilisateur_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update([
            'lu'    => true,
            'lu_le' => now(),
        ]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('utilisateur_id', $request->user()->id)
            ->where('lu', false)
            ->update([
                'lu'    => true,
                'lu_le' => now(),
            ]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }
}
