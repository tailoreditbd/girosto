<?php
declare(strict_types=1);

$root = __DIR__;
$xlsx = $root . '/shop/Girosto Price List- 10-07-2026 - Retail.xlsx';
$out = $root . '/data/products.json';

$categories = [
    'চালঃ' => ['slug' => 'rice', 'name' => 'Rice', 'file' => 'BuyOrganicRiceOnlineinBangladeshGirosto.html', 'icon' => 'bi-basket2'],
    'সরিষার তেলঃ' => ['slug' => 'mustard-oil', 'name' => 'Mustard Oil', 'file' => 'BuyPureMustardOilOnlineinBangladeshGirosto.html', 'icon' => 'bi-droplet-half'],
    'অয়েলঃ অলিভ/ সানফ্লাওয়ার/কোকোনাট' => ['slug' => 'healthy-oils', 'name' => 'Healthy Oils', 'file' => 'BuyPremiumHealthyOilOnlineinBangladeshGirosto.html', 'icon' => 'bi-moisture'],
    'ডালঃ' => ['slug' => 'lentils-pulses', 'name' => 'Lentils & Pulses', 'file' => 'BuyPremiumLentilsPulsesinBangladeshGirosto.html', 'icon' => 'bi-circle-half'],
    'মশলাপাতিঃ' => ['slug' => 'ground-spices', 'name' => 'Ground Spices', 'file' => 'BuyPremiumGroundSpicesinBangladeshGirosto.html', 'icon' => 'bi-fire'],
    'আস্ত মসলাঃ' => ['slug' => 'whole-spices', 'name' => 'Whole Spices', 'file' => 'BuyPremiumWholeSpicesinBangladeshGirosto.html', 'icon' => 'bi-stars'],
    'চিনিঃ' => ['slug' => 'sugar', 'name' => 'Sugar', 'file' => 'BuyPremiumSugarOnlineinBangladeshGirosto.html', 'icon' => 'bi-hexagon'],
    'গুড়ঃ' => ['slug' => 'jaggery', 'name' => 'Jaggery', 'file' => 'BuyPremiumJaggeryinBangladeshGirosto.html', 'icon' => 'bi-brightness-alt-high'],
    'হোম মেইড আচারঃ' => ['slug' => 'homemade-pickles', 'name' => 'Homemade Pickles', 'file' => 'HomemadePicklesinBangladeshGirosto.html', 'icon' => 'bi-jar'],
    'Seeds:' => ['slug' => 'healthy-seeds', 'name' => 'Healthy Seeds', 'file' => 'BuyPremiumHealthySeedsinBangladeshGirosto.html', 'icon' => 'bi-flower1'],
    'Essential Oil/ Hair Care/ Skin Care' => ['slug' => 'hair-skin-care', 'name' => 'Hair & Skin Care', 'file' => 'HairskincareoilsinBangladeshGirosto.html', 'icon' => 'bi-heart'],
    'ডেইরি/পোল্ট্রিঃ' => ['slug' => 'dairy-poultry', 'name' => 'Dairy & Poultry', 'file' => 'BuyPremiumDairyPoultryinBangladeshGirosto.html', 'icon' => 'bi-egg'],
    'অন্যান্য ডেইলি নিডসঃ' => ['slug' => 'daily-needs', 'name' => 'Daily Needs', 'file' => 'BuyDailyHealthyFoodinBangladesh.html', 'icon' => 'bi-bag-check'],
    'গিরস্ত স্পেশালঃ' => ['slug' => 'girosto-special', 'name' => 'Girosto Special', 'file' => 'GirostoSpecialItemsinBangladesh.html', 'icon' => 'bi-award'],
    'মধুঃ' => ['slug' => 'honey', 'name' => 'Original Honey', 'file' => 'OriginalHoneyinBangladesh.html', 'icon' => 'bi-droplet'],
    'খেজুর/ ড্রাই ফ্রুটস' => ['slug' => 'dates-dry-fruits', 'name' => 'Dates & Dry Fruits', 'file' => 'PremiumDatesDryFruitsinBangladesh.html', 'icon' => 'bi-sun'],
    'বাদামঃ' => ['slug' => 'nuts', 'name' => 'Premium Nuts', 'file' => 'PremiumNutsinBangladesh.html', 'icon' => 'bi-nut'],
    'হার্ব পাউডার' => ['slug' => 'herb-powders', 'name' => 'Herb Powders', 'file' => 'OrganicHerbPowderinBangladesh.html', 'icon' => 'bi-flower3'],
    'হেলথ আইটেমঃ' => ['slug' => 'health-items', 'name' => 'Health Items', 'file' => 'GenuineHealthItemsinBangladesh.html', 'icon' => 'bi-activity'],
    'ফল-ফলাদিঃ' => ['slug' => 'fresh-fruits', 'name' => 'Fresh Fruits', 'file' => 'OrganicFreshFruitsinBangladesh.html', 'icon' => 'bi-apple'],
];

if (!class_exists('ZipArchive')) {
    throw new RuntimeException('PHP ZipArchive is required.');
}
$zip = new ZipArchive();
if ($zip->open($xlsx) !== true) {
    throw new RuntimeException('Unable to open workbook: ' . $xlsx);
}

$shared = [];
$sharedXml = simplexml_load_string((string)$zip->getFromName('xl/sharedStrings.xml'));
foreach ($sharedXml->si as $si) {
    $value = (string)$si->t;
    foreach ($si->r as $run) $value .= (string)$run->t;
    $shared[] = trim($value);
}

$sheet = simplexml_load_string((string)$zip->getFromName('xl/worksheets/sheet1.xml'));
$rows = [];
foreach ($sheet->sheetData->row as $row) {
    $cells = [];
    foreach ($row->c as $cell) {
        preg_match('/^[A-Z]+/', (string)$cell['r'], $match);
        $column = $match[0];
        $value = (string)$cell->v;
        if ((string)$cell['t'] === 's') $value = $shared[(int)$value] ?? '';
        $cells[$column] = trim($value);
    }
    $rows[] = $cells;
}
$zip->close();

$products = [];
$usedIds = [];
$state = [
    'left' => ['category' => null, 'last' => null],
    'right' => ['category' => null, 'last' => null],
];

function idFor(string $serial, int $row, array &$used): string {
    $base = $serial !== '' && ctype_digit($serial) ? 'g-' . str_pad($serial, 3, '0', STR_PAD_LEFT) : 'g-row-' . $row;
    $id = $base; $suffix = 2;
    while (isset($used[$id])) $id = $base . '-' . $suffix++;
    $used[$id] = true;
    return $id;
}

function addSide(array $cells, string $side, int $rowNumber, array $columns, array $categories, array &$state, array &$products, array &$usedIds): void {
    [$serialCol, $nameCol, $sizeCol, $priceCol] = $columns;
    $serial = trim((string)($cells[$serialCol] ?? ''));
    $name = trim((string)($cells[$nameCol] ?? ''));
    $size = trim((string)($cells[$sizeCol] ?? ''));
    $priceRaw = trim((string)($cells[$priceCol] ?? ''));

    if ($serial !== '' && !ctype_digit($serial) && $name === '' && $size === '' && $priceRaw === '') {
        if (isset($categories[$serial])) $state[$side]['category'] = $categories[$serial];
        $state[$side]['last'] = null;
        return;
    }
    if (!$state[$side]['category']) return;

    $price = $priceRaw !== '' && $priceRaw !== '-' && is_numeric($priceRaw) ? (int)$priceRaw : null;
    if ($name !== '') {
        $category = $state[$side]['category'];
        $product = [
            'id' => idFor($serial, $rowNumber, $usedIds),
            'sku' => $serial !== '' ? 'GIR-' . str_pad($serial, 3, '0', STR_PAD_LEFT) : 'GIR-R' . $rowNumber,
            'name' => $name,
            'category' => $category['slug'],
            'categoryName' => $category['name'],
            'categoryFile' => $category['file'],
            'icon' => $category['icon'],
            'description' => $name . ' from Girosto’s ' . $category['name'] . ' collection, selected for dependable quality and convenient household use.',
            'variants' => [['size' => $size ?: 'Standard pack', 'price' => $price]],
        ];
        $products[] = $product;
        $state[$side]['last'] = count($products) - 1;
        return;
    }
    if ($size !== '' && $state[$side]['last'] !== null) {
        $products[$state[$side]['last']]['variants'][] = ['size' => $size, 'price' => $price];
    }
}

foreach ($rows as $index => $cells) {
    if ($index < 6) continue;
    addSide($cells, 'left', $index + 1, ['A', 'B', 'C', 'D'], $categories, $state, $products, $usedIds);
    addSide($cells, 'right', $index + 1, ['E', 'F', 'G', 'H'], $categories, $state, $products, $usedIds);
}

$featuredNames = ['পোলাও চাল - চিনিগুঁড়া', 'ভার্জিন (কোল্ড প্রেসড)', 'সুন্দরবনের খলিশা ফুলের মধু (প্রাকৃতিক)', 'কাজু বাদাম'];
foreach ($products as &$product) {
    $product['featured'] = in_array($product['name'], $featuredNames, true);
    $product['available'] = count(array_filter($product['variants'], fn($variant) => $variant['price'] !== null)) > 0;
}
unset($product);

if (!is_dir(dirname($out))) mkdir(dirname($out), 0777, true);
file_put_contents($out, json_encode([
    'source' => basename($xlsx),
    'updated' => '2026-08-01',
    'currency' => 'BDT',
    'categories' => array_values($categories),
    'products' => $products,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

echo 'Imported ' . count($products) . " products to data/products.json\n";
