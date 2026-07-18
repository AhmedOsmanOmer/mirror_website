<x-mail::message>
# Reset your password

Hi {{ $name }},

We received a request to reset your password. Use the code below to continue. This code expires in 15 minutes.

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

If you didn't request a password reset, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
