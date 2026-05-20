<?php
         include('payment_config.php');
            $query=$_GET['query'];
            //  die( $query);
            $privateKey = "Wq0F6lS7A5tIJU90";
            $privateValue = "lo4syhqHnRjm4L0T";
            $decText = null;
            include('encrypt-decrypt.php');
            $EncryptDecrypt = new EncryptDecrypt();
            $decText = $EncryptDecrypt -> decrypt($query,$privateValue,$privateKey);
            $decryptValues = explode('&', $decText);

            //print_r($decryptValues);
            $dataSize = sizeof($decryptValues);
            $pg_transt_id = explode('=', $decryptValues[0]);
            //print_r($pg_transt_id);
            // $order_id = explode('=', $decryptValues[4]);
            // print_r($order_id);
            // $tracking_id = explode('=', $decryptValues[1]);
            // print_r($tracking_id);
            $amount = explode('=', $decryptValues[2]);
            //print_r($amount);
            $order_status = explode('=', $decryptValues[13]);
            //print_r($order_status);


            $pg_transt_id = $pg_transt_id[1];
            $order_status = ucfirst($order_status[1]);
            $amount = $amount[1];

         
    
          ?>