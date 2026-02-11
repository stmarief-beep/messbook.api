<?php
echo "<h1>Deployment Diagnostics</h1>";
echo "<h3>Current Working Directory:</h3>";
echo getcwd() . "<br>";

echo "<h3>User Info:</h3>";
echo "User: " . posix_getpwuid(posix_geteuid())['name'] . "<br>";

echo "<h3>Checking for Node.js:</h3>";
$node_path = shell_exec('which node');
echo "Node path: " . ($node_path ? $node_path : "NOT FOUND") . "<br>";

$npm_path = shell_exec('which npm');
echo "NPM path: " . ($npm_path ? $npm_path : "NOT FOUND") . "<br>";

echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r($_SERVER);
echo "</pre>";

echo "<h3>Directory Listing:</h3>";
echo "<pre>";
system('ls -la ..');
echo "</pre>";
?>
