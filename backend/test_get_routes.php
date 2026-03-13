<?php
chdir('api');
$_GET['action'] = 'get_routes';
$_GET['search'] = '';
include 'route_planner.php';
?>
