<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

ini_set(‘gd.jpeg_ignore_warning’, 1);
ini_set('memory_limit', '1024M');

$content = file_get_contents(__DIR__."/datas.json");
$cards = json_decode($content, true);

$count = 0;

$responseRecto = readline("Voulez vous télécharger les images recto ? Y/n (Y)");
$responseVerso = readline("Voulez vous télécharger les images versos ? Y/n (Y)");

foreach($cards as $key => $card){
	$imgRectoName = $card["img_recto"];
	$imgVersoName  = $card["img_verso"];

	if($responseRecto === "Y"){
		if($imgRectoName){
			exec("curl http://datarmor.cotesdarmor.fr/documents/10184/22002/".$card["img_recto"]." > ../static/images/cards/".$imgRectoName);
		}
	}
	if($responseVerso === "Y"){
		if($imgVersoName){
			exec("curl http://datarmor.cotesdarmor.fr/documents/10184/22002/".$card["img_verso"]." > ../static/images/cards/".$imgVersoName);
		}
	}

	if($imgRectoName){
		$card["img_recto"] = $imgRectoName;
		$count++;
	} else {
		$cards[$key] = null;
	}

	if($imgVersoName){
		$card["img_verso"] = $imgVersoName;
	}

	$card["img_rank"] = intval($count);
	$cards[$key] = $card;
}


header ("Content-type: image/png");

$gridSize = ceil(sqrt($count));
$rat = 14/9;
$width = 8096;
$height = ceil($width/$rat);

$stepWidth = floor($width/$gridSize);
$stepHeight = floor($height/$gridSize);

$imageRecto = imagecreatetruecolor($width, $height);
$imageVerso = imagecreatetruecolor($width, $height);
$countImagesNotWorking = 0;

foreach($cards as $key => $card){

	$recto = imagecreatefromjpeg("img/".$card["img_recto"]); // La photo est la destination
	$card["img_working"] = true;

	if($recto && exif_imagetype("img/".$card["img_recto"]) == IMAGETYPE_JPEG){
		$rectoResized =  imagecreatetruecolor($stepWidth, $stepHeight);

		$widthCard = imagesx($recto);
		$heightCard = imagesy($recto);

		$col = ($card["img_rank"] - 1)%$gridSize;
		$line = floor(($card["img_rank"] - 1)/$gridSize);

		$destination_x = $stepWidth*$col;
		$destination_y =  $stepHeight*$line;

		imagecopyresampled($rectoResized, $recto, 0, 0, 0, 0, $stepWidth, $stepHeight, $widthCard, $heightCard);
		imagecopymerge($imageRecto, $rectoResized, $destination_x, $destination_y, 0, 0, $stepWidth, $stepHeight, 100);

	} else {
		$card["img_working"] = false;
	}

	$verso = imagecreatefromjpeg("img/".$card["img_verso"]); // La photo est la destination

	if($verso && exif_imagetype("img/".$card["img_verso"]) == IMAGETYPE_JPEG){
		$versoResized =  imagecreatetruecolor($stepWidth, $stepHeight);

		$widthCard = imagesx($verso);
		$heightCard = imagesy($verso);

		$col = ($card["img_rank"] - 1)%$gridSize;
		$line = floor(($card["img_rank"] - 1)/$gridSize);

		$destination_x = $stepWidth*$col;
		$destination_y =  $stepHeight*$line;

		imagecopyresampled($versoResized, $verso, 0, 0, 0, 0, $stepWidth, $stepHeight, $widthCard, $heightCard);
		imagecopymerge($imageVerso, $versoResized, $destination_x, $destination_y, 0, 0, $stepWidth, $stepHeight, 100);
	} else {
		$card["img_working"] = false;
	}

	if($card["img_working"] === false){
		$countImagesNotWorking++;
	}

	$cards[$key] = $card;
}


$outContent = json_encode($cards);
$myfile = fopen("output.json", "w");
fwrite($myfile, $outContent);
fclose($myfile);


imagepng($imageRecto, "img_recto.png"); // on enregistre l'image dans le dossier "images"
imagepng($imageVerso, "img_verso.png"); // on enregistre l'image dans le dossier "images"

echo "-------------RESULT------------\n";
echo "Total cards : ".count($cards)."\n";
echo "Total cards without photos : ".$countImagesNotWorking."\n";
echo "-------------/RESULT------------\n";
