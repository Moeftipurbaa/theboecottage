<?php

/*
|--------------------------------------------------------------------------
| The Boe Cottage — Public Site Configuration
|--------------------------------------------------------------------------
|
| Values shared with the React frontend through Inertia (see
| HandleInertiaRequests::share()). Override any of them in .env so the
| marketing team can update links without touching code.
|
*/

return [

    'social' => [
        'instagram' => env('BOE_INSTAGRAM_URL', 'https://www.instagram.com/theboecottage/'),
        'tiktok' => env('BOE_TIKTOK_URL', 'https://www.tiktok.com/@theboecottage'),
    ],

    /*
    | OTA listing URLs per bookable unit. Replace the search fallbacks with the
    | exact listing URLs from the Airbnb / Tiket.com host dashboards.
    */
    'ota' => [
        'whole_cottage' => [
            'airbnb' => env('BOE_AIRBNB_WHOLE_URL', 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Dieng'),
            'tiket_com' => env('BOE_TIKET_WHOLE_URL', 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng'),
        ],
        'daisy-room' => [
            'airbnb' => env('BOE_AIRBNB_DAISY_URL', 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Daisy%20Room'),
            'tiket_com' => env('BOE_TIKET_DAISY_URL', 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng'),
        ],
        'lily-room' => [
            'airbnb' => env('BOE_AIRBNB_LILY_URL', 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Lily%20Room'),
            'tiket_com' => env('BOE_TIKET_LILY_URL', 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng'),
        ],
    ],

    'maps' => [
        'place_query' => env('BOE_MAPS_QUERY', 'The Boe Cottage, QRRP+PHM, Sumberejo, Batur, Banjarnegara, Jawa Tengah'),
        'rating' => env('BOE_MAPS_RATING', '5.0'),
    ],

    /*
    | Developer-only iCal test panel on the public landing page. It exposes
    | outbound .ics export URLs (with secret tokens) and a "Test Sync" button,
    | so it is only ever enabled for the `local` environment.
    */
    'ical_test_panel' => (bool) env('BOE_ICAL_TEST_PANEL', true),

];

