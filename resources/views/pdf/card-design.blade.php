<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
        }

        html {
            margin: 0;
            padding: 0;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: {{ $selectedColor }};
        }

        img {
            display: block;
            width: 100%;
        }
    </style>
</head>
<body>
    <img src="{{ $imageDataUri }}" alt="Card design">
</body>
</html>
