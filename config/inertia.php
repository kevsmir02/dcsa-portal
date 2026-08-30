<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Page components
    |--------------------------------------------------------------------------
    |
    | The package looks for page components in `resources/js/Pages` by default.
    | This app keeps them in lowercase `resources/js/pages`, so point both the
    | application and testing finders at the real directory -- otherwise
    | `assertInertia(...)->component(...)` fails for every page.
    |
    */

    'page_paths' => [
        resource_path('js/pages'),
    ],

    'page_extensions' => [
        'jsx',
        'tsx',
        'vue',
    ],

    'testing' => [

        'ensure_pages_exist' => true,

        'page_paths' => [
            resource_path('js/pages'),
        ],

        'page_extensions' => [
            'jsx',
            'tsx',
            'vue',
        ],

    ],

];
