<?php
declare(strict_types=1);

$id = strtolower((string) ($_GET['id'] ?? ''));
if (!preg_match('/^g-\d+(?:-\d+)?$/', $id)) {
    http_response_code(404);
    exit('Product not found.');
}

$registryPath = __DIR__ . '/data/product-slugs.json';
$registry = json_decode((string) file_get_contents($registryPath), true);
$slug = is_array($registry) ? ($registry[$id] ?? null) : null;
if (!is_string($slug) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
    http_response_code(404);
    exit('Product not found.');
}

$requestPath = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$basePath = preg_replace('#/shop/product/.*$#', '', $requestPath) ?: '';
header('Location: ' . $basePath . '/shop/product/' . $slug, true, 301);
exit;
