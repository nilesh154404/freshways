<?php

include("payment_config.php");
$customer_name ="umesh jaiswal";

$txnId = "123441254554647umesh";
$txnAmt = "10";
$arr1 = explode(' ',trim($customer_name));
$pfname = $arr1[0];
$pmno = "7767834643";
$pemail = "umeshjaiswal34@gmail.com";
$settlement_split ='online_'.$txnAmt.'~';

$RouterUrl="?mcode=".$merchant_code."&uname=".$username."&psw=".$password."&amount=".$txnAmt."&settlement_split=".$settlement_split."&mtxnId=".$txnId."&pfname=".$pfname."&plname=&pmno=".$pmno."&pemail=".$pemail."&padd=&surl=".$URLsuccess."&furl=".$URLfail."&udf6=";
  //  die();

include("encrypt-decrypt.php");

 $EncryptDecrypt = new EncryptDecrypt();

 $RouterUrl = $EncryptDecrypt -> encrypt($RouterUrl,$privateValue,$privateKey); 

 $RouterUrl = str_replace("+", "%2B",$RouterUrl); 

 $RouterUrl="?query=".$RouterUrl."&mcode=".$merchant_code;

 $RouterUrl = $RouterDomain.$RouterUrl;

 //$RouterUrl = $RouterUrl.Replace(" ", "%20");

 //$query=$_REQUEST['query'];
  
 $query=$RouterUrl;
  
?>
  
  
<form method="POST" name="redirect" action="<?php echo $query ?>">
    <?php
    echo "<input type=hidden name=query value=$query>";
    echo "<input type=hidden name=mcode value=$merchant_code>";
    ?>
  </form>
  <script language='javascript'>document.redirect.submit();</script>
 

 
</body>
</html>


