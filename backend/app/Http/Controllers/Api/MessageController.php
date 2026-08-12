<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    private const MAX_RECIPIENTS = 5;
    private const SEND_DELAY_SECONDS = 1;

    public function __construct(private readonly WhatsAppService $whatsapp)
    {
    }

    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'to' => ['required', 'array', 'min:1', 'max:'.self::MAX_RECIPIENTS, 'distinct'],
            'to.*' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'message' => ['required', 'string', 'max:4096'],
        ], [
            'to.required' => 'Minimal pilih 1 nomor penerima.',
            'to.max' => 'Maksimal '.self::MAX_RECIPIENTS.' nomor penerima.',
            'to.distinct' => 'Nomor penerima tidak boleh duplikat.',
            'to.*.regex' => 'Format nomor harus numerik (contoh: 6281234567890).',
            'message.required' => 'Pesan wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $results = [];
        $recipients = $request->input('to');
        $message = $request->input('message');

        foreach ($recipients as $index => $phone) {
            $results[] = ['to' => $phone] + $this->whatsapp->send($phone, $message);

            if ($index < count($recipients) - 1) {
                sleep(self::SEND_DELAY_SECONDS);
            }
        }

        return response()->json(['results' => $results]);
    }
}
