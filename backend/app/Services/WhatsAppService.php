<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class WhatsAppService
{
    public function send(string $to, string $message): array
    {
        return match (config('services.whatsapp.driver')) {
            'fonnte' => $this->sendViaFonnte($to, $message),
            'meta' => $this->sendViaMeta($to, $message),
            default => throw new \InvalidArgumentException(
                'Driver WhatsApp "'.config('services.whatsapp.driver').'" tidak dikenali.'
            ),
        };
    }

    private function sendViaFonnte(string $to, string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => config('services.whatsapp.fonnte.token'),
            ])->asForm()->post(config('services.whatsapp.fonnte.base_url'), [
                'target' => $to,
                'message' => $message,
                'countryCode' => '62',
            ]);

            $body = $response->json();

            return $this->isFonnteSuccess($body)
                ? $this->ok()
                : $this->fail($body['reason'] ?? 'Response tidak valid dari Fonnte');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage());
        }
    }

    private function sendViaMeta(string $to, string $message): array
    {
        try {
            $response = Http::withToken(config('services.whatsapp.meta.token'))
                ->post(
                    config('services.whatsapp.meta.base_url')
                        .'/'.config('services.whatsapp.meta.phone_number_id')
                        .'/messages',
                    [
                        'messaging_product' => 'whatsapp',
                        'to' => $to,
                        'type' => 'text',
                        'text' => ['body' => $message],
                    ]
                );

            return $response->successful()
                ? $this->ok()
                : $this->fail($response->json('error.message') ?? 'Gagal mengirim pesan');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage());
        }
    }

    private function isFonnteSuccess(?array $body): bool
    {
        return ($body['status'] ?? $body['Status'] ?? false) === true;
    }

    private function ok(): array
    {
        return ['status' => 'success'];
    }

    private function fail(string $error): array
    {
        return ['status' => 'error', 'error' => $error];
    }
}
