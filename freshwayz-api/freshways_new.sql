-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: freshways
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth`
--

DROP TABLE IF EXISTS `auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `userId` int DEFAULT NULL,
  `vendorId` int DEFAULT NULL,
  `customerId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_366ebf23d8f3781bb7bb37abbd` (`username`),
  UNIQUE KEY `REL_373ead146f110f04dad6084815` (`userId`),
  UNIQUE KEY `REL_2e061472e056b1898400fde872` (`vendorId`),
  UNIQUE KEY `REL_158cdabf0c5e987510735f57d7` (`customerId`),
  CONSTRAINT `FK_158cdabf0c5e987510735f57d71` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`),
  CONSTRAINT `FK_2e061472e056b1898400fde872e` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`),
  CONSTRAINT `FK_373ead146f110f04dad60848154` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth`
--

LOCK TABLES `auth` WRITE;
/*!40000 ALTER TABLE `auth` DISABLE KEYS */;
INSERT INTO `auth` VALUES (4,'nilesh.choubisa','$2b$10$UkVglhN9ZQ5O2iasJBNLa.uq8R6/l.kLp7MLw8ogeSwxK.sGBKKtK','2026-01-13 11:35:04.791981','2026-01-13 11:35:04.791981',2,NULL,NULL),(5,'adityavajale@gmail.com','$2b$10$/zY7.uZXtbm.gEyp0eSd6u8xbMe7MQK/G1i0NlFBF2yTYXs4vftUK','2026-01-13 12:13:38.184368','2026-01-13 12:13:38.184368',NULL,2,NULL),(6,'paresh@gmail.com','$2b$10$iZAHx5VlMGpbcxZIiGzwiuibFP2iZH7UhQqYcknPJ0DroPyGV/tB2','2026-01-13 12:24:56.638765','2026-01-13 12:24:56.638765',NULL,3,NULL),(7,'vivek@gmail.com','$2b$10$0joOFvL14XC8s8zvqQKRQeUF5VPTbsn3BPei4A9kVMItOrYOs6hay','2026-01-13 12:27:37.306299','2026-01-13 12:27:37.306299',NULL,4,NULL),(8,'umesh@gmail.com','$2b$10$fHKhfeH21KZksJ8j.aHHjeLxH39qG/EN4WW4zg54/IKknBzNLwFdS','2026-01-13 15:21:55.856459','2026-01-13 15:21:55.856459',NULL,5,NULL);
/*!40000 ALTER TABLE `auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `img_link` text,
  `name` varchar(255) NOT NULL,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Monthly Groceries',1,'http://freshwayz.dexpertsystems.com/uploads/1766120404776-403786728.webp','Monthly Groceries',NULL),(2,'Dry Fruits',1,'http://freshwayz.dexpertsystems.com/uploads/1766121324071-844245639.jpg','Dry Fruits',NULL),(3,'Cold Pressed Oils',1,'http://freshwayz.dexpertsystems.com/uploads/1766121381794-629016540.jpg','Cold Pressed Oils',NULL),(4,'Dairy',1,'http://freshwayz.dexpertsystems.com/uploads/1766121437295-510391829.jpg','Dairy',NULL),(5,'Fruits (Sesonal & Exotics)',1,'https://img.freepik.com/free-psd/vibrant-fruit-explosion-bursting-with-juicy-goodness-delightful-mix-colors-flavors_191095-90502.jpg','Fruits (Sesonal & Exotics)',NULL),(6,'Exotics Vegetable',1,'http://freshwayz.dexpertsystems.com/uploads/1766121802785-44638891.jpg','Exotics Vegetable',NULL),(7,'Gyms',1,'https://freshwayz.dexpertsystems.com/uploads/1768273253462-410154738.jpg','Gyms',NULL),(8,'Yoga',1,'https://freshwayz.dexpertsystems.com/uploads/1768273396769-626823110.jpg','Yoga',NULL),(9,'Healthy Snacks',1,'http://freshwayz.dexpertsystems.com/uploads/1766121871881-577436698.jpg','Healthy Snacks',NULL),(10,'Pathalogy',1,'https://freshwayz.dexpertsystems.com/uploads/1768273478118-199598072.jpg','Pathalogy',NULL),(11,'Millets',1,'https://freshwayz.dexpertsystems.com/uploads/1768273546590-249956807.jpg','Millets',NULL),(12,'Fresh Juices',1,'https://freshwayz.dexpertsystems.com/uploads/1768273625255-653183421.jpg','Fresh Juices',NULL),(13,'Salads',1,'https://freshwayz.dexpertsystems.com/uploads/1768273667833-570795183.jpg','Salads',NULL),(14,'Healthy Meals',1,'https://freshwayz.dexpertsystems.com/uploads/1768273700575-368877699.jpg','Healthy Meals',NULL),(15,'Icecreams Sugarfree',1,'https://freshwayz.dexpertsystems.com/uploads/1768273745321-786489131.jpg','Icecreams Sugarfree',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community`
--

DROP TABLE IF EXISTS `community`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_198f18552bc2c404cc62bf3b6f` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community`
--

LOCK TABLES `community` WRITE;
/*!40000 ALTER TABLE `community` DISABLE KEYS */;
INSERT INTO `community` VALUES (1,'Geras','geras','COMMERCIAL','Pune, Maharashtra');
/*!40000 ALTER TABLE `community` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_customers_customer`
--

DROP TABLE IF EXISTS `community_customers_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_customers_customer` (
  `communityId` int NOT NULL,
  `customerId` int NOT NULL,
  PRIMARY KEY (`communityId`,`customerId`),
  KEY `IDX_59da5eab15ea1389cb8fe62216` (`communityId`),
  KEY `IDX_3dc9b06261541dd2518eb25776` (`customerId`),
  CONSTRAINT `FK_3dc9b06261541dd2518eb25776f` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`),
  CONSTRAINT `FK_59da5eab15ea1389cb8fe622163` FOREIGN KEY (`communityId`) REFERENCES `community` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_customers_customer`
--

LOCK TABLES `community_customers_customer` WRITE;
/*!40000 ALTER TABLE `community_customers_customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_customers_customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_message`
--

DROP TABLE IF EXISTS `community_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `communityId` int DEFAULT NULL,
  `senderId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_95c335551498522e5c6f2447e68` (`communityId`),
  KEY `FK_68b720ca8b56fea62aa0268c45b` (`senderId`),
  CONSTRAINT `FK_68b720ca8b56fea62aa0268c45b` FOREIGN KEY (`senderId`) REFERENCES `customer` (`id`),
  CONSTRAINT `FK_95c335551498522e5c6f2447e68` FOREIGN KEY (`communityId`) REFERENCES `community` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_message`
--

LOCK TABLES `community_message` WRITE;
/*!40000 ALTER TABLE `community_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `bloodGroup` varchar(255) DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `medicalHistory` text,
  `goal` text,
  `community` varchar(255) DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `locality` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `userTypeId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fdb2f3ad8115da4c7718109a6e` (`email`),
  KEY `FK_c678bdb520b5c80168c8f481cd8` (`userTypeId`),
  CONSTRAINT `FK_c678bdb520b5c80168c8f481cd8` FOREIGN KEY (`userTypeId`) REFERENCES `user_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (15,'paresh','paresh@gmail.com','7972872262','1998-11-14','male','O+',151,80,'bp','weght loss','gera','pune','pune','2025-11-28 16:10:33.158094','2025-11-28 16:10:33.158094',1);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_price`
--

DROP TABLE IF EXISTS `daily_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_price` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '0',
  `productId` int NOT NULL,
  `vendorId` int NOT NULL,
  `mrp_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b47df8932ad27315b810b8b6cd` (`productId`,`vendorId`),
  UNIQUE KEY `IDX_71d97d16637c788ad2d9d20675` (`productId`,`vendorId`,`date`),
  KEY `FK_e355d556a899b0a70edd42651f1` (`vendorId`),
  CONSTRAINT `FK_c4b7dbe0b3e5f91326ba7b26f5d` FOREIGN KEY (`productId`) REFERENCES `product` (`id`),
  CONSTRAINT `FK_e355d556a899b0a70edd42651f1` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_price`
--

LOCK TABLES `daily_price` WRITE;
/*!40000 ALTER TABLE `daily_price` DISABLE KEYS */;
INSERT INTO `daily_price` VALUES (16,40.00,'2026-01-13',1,1,1,50.00),(17,35.00,'2026-01-13',1,2,1,45.00),(18,48.00,'2026-01-13',1,3,1,55.00),(28,1220.00,'2026-01-13',1,4,1,1520.00),(29,450.00,'2026-01-13',1,5,1,550.00),(30,150.00,'2026-01-13',1,6,1,200.00),(31,500.00,'2026-01-13',1,7,1,520.00),(32,150.00,'2026-01-13',1,8,1,200.00),(33,258.00,'2026-01-13',1,9,1,318.00),(34,30.00,'2026-01-13',1,10,1,41.50),(35,57.00,'2026-01-13',1,11,1,72.00),(36,26.00,'2026-01-13',1,12,1,59.00),(37,169.00,'2026-01-13',1,13,1,234.00),(38,99.00,'2026-01-13',1,14,1,199.00),(39,13120.00,'2026-01-13',1,16,4,15000.00),(40,9999.00,'2026-01-13',1,17,4,14999.00),(42,87.36,'2026-01-13',1,18,1,168.00),(43,84.00,'2026-01-13',1,19,1,168.00),(44,200.00,'2026-01-13',1,20,1,250.00),(45,1500.00,'2026-01-13',1,15,2,1700.00),(46,73.00,'2026-01-13',1,21,1,87.00),(47,160.00,'2026-01-13',1,22,1,200.00),(48,249.00,'2026-01-13',1,23,1,349.00),(49,35.00,'2026-01-13',1,24,1,45.00),(50,45.00,'2026-01-13',1,25,1,60.00),(51,220.00,'2026-01-13',1,26,1,250.00),(52,160.00,'2026-01-13',1,27,1,195.00),(53,1200.00,'2026-01-13',1,28,3,1500.00),(54,1000.00,'2026-01-13',1,29,3,1200.00);
/*!40000 ALTER TABLE `daily_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_slots`
--

DROP TABLE IF EXISTS `delivery_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `startTime` varchar(255) DEFAULT NULL,
  `endTime` varchar(255) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `vendorSubscriptionPlanId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8b4e5e3e0b79c0cba52885c478b` (`vendorSubscriptionPlanId`),
  CONSTRAINT `FK_8b4e5e3e0b79c0cba52885c478b` FOREIGN KEY (`vendorSubscriptionPlanId`) REFERENCES `vendor_subscription_plan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_slots`
--

LOCK TABLES `delivery_slots` WRITE;
/*!40000 ALTER TABLE `delivery_slots` DISABLE KEYS */;
INSERT INTO `delivery_slots` VALUES (1,'2024-12-26','06:00 am','09:00 am',1,1,'2026-01-13 09:05:51.561197','2026-01-13 09:05:51.561197',1),(4,'2024-12-26','12:00 pm','01:00 pm',1,1,'2026-01-13 09:12:27.160040','2026-01-13 09:12:27.160040',1),(5,'2024-12-26','05:00 pm','07:00 pm',1,1,'2026-01-13 09:12:27.160795','2026-01-13 09:12:27.160795',1),(6,'2024-12-26','Sunday','',1,1,'2026-01-13 09:12:27.161395','2026-01-13 11:51:46.287033',2),(7,'2024-12-26','Wednesday',NULL,1,1,'2026-01-13 09:12:27.162061','2026-01-13 11:51:46.288082',2),(8,'2024-12-26','01','05 of every month',1,1,'2026-01-13 09:12:27.162726','2026-01-13 11:51:46.288853',3),(9,'2025-01-01','10:00','12:00',20,1,'2026-01-13 14:30:40.337652','2026-01-13 14:30:40.337652',NULL),(10,'2024-12-26','05:00 pm','10:00 pm',1,1,'2026-01-13 09:12:27.160040','2026-01-13 09:12:27.160040',4),(11,'2024-12-26','06:00 am','12:00 pm',1,1,'2026-01-13 09:12:27.160040','2026-01-13 09:12:27.160040',4);
/*!40000 ALTER TABLE `delivery_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_upload`
--

DROP TABLE IF EXISTS `file_upload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_upload` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) NOT NULL,
  `fileUrl` varchar(255) NOT NULL,
  `marketingContentId` int DEFAULT NULL,
  `customerId` int DEFAULT NULL,
  `tenantId` int DEFAULT NULL,
  `vendorId` int DEFAULT NULL,
  `orderId` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_c8f078a3b3ad63fce6f44a826a4` (`marketingContentId`),
  CONSTRAINT `FK_c8f078a3b3ad63fce6f44a826a4` FOREIGN KEY (`marketingContentId`) REFERENCES `marketing_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_upload`
--

LOCK TABLES `file_upload` WRITE;
/*!40000 ALTER TABLE `file_upload` DISABLE KEYS */;
INSERT INTO `file_upload` VALUES (1,'1768291236733-416530995.jpg','https://freshwayz.dexpertsystems.com/uploads/1768291236733-416530995.jpg',NULL,NULL,NULL,NULL,NULL,'2026-01-13 13:30:36.798862'),(2,'1768294463842-291795336.jpg','http://192.168.1.36:3064/uploads/1768294463842-291795336.jpg',7,NULL,NULL,NULL,NULL,'2026-01-13 14:24:24.018163'),(4,'1768295904881-967461301.jpg','http://192.168.1.36:3064/uploads/1768295904881-967461301.jpg',9,NULL,NULL,NULL,NULL,'2026-01-13 14:48:25.442817'),(5,'1768296743018-283053669.jpeg','http://192.168.1.36:3064/uploads/1768296743018-283053669.jpeg',10,NULL,NULL,NULL,NULL,'2026-01-13 15:02:23.598449'),(6,'1768297363450-281531720.jpeg','http://192.168.1.36:3064/uploads/1768297363450-281531720.jpeg',11,NULL,NULL,NULL,NULL,'2026-01-13 15:12:44.218123'),(7,'1768298126161-654141385.jpeg','https://freshwayz.dexpertsystems.com/uploads/1768298126161-654141385.jpeg',NULL,NULL,NULL,NULL,NULL,'2026-01-13 15:25:26.204983'),(8,'1768298949839-96706625.webp','http://192.168.1.36:3064/uploads/1768298949839-96706625.webp',12,NULL,NULL,NULL,NULL,'2026-01-13 15:39:10.498220'),(9,'1768298949960-995223314.jpeg','http://192.168.1.36:3064/uploads/1768298949960-995223314.jpeg',12,NULL,NULL,NULL,NULL,'2026-01-13 15:39:10.505705'),(10,'1768298949987-930483107.jpeg','http://192.168.1.36:3064/uploads/1768298949987-930483107.jpeg',12,NULL,NULL,NULL,NULL,'2026-01-13 15:39:10.513187');
/*!40000 ALTER TABLE `file_upload` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listed_order`
--

DROP TABLE IF EXISTS `listed_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listed_order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `discountedAmount` decimal(10,2) DEFAULT NULL,
  `notes` varchar(50) DEFAULT NULL,
  `orderId` int NOT NULL,
  `productId` int DEFAULT NULL,
  `productDiscountId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9ec46e48f2deb62dc1c3022eab8` (`orderId`),
  KEY `FK_c1877e424f93bb1f138e3935d24` (`productId`),
  KEY `FK_4f440415e6a4e49b518383f960f` (`productDiscountId`),
  CONSTRAINT `FK_4f440415e6a4e49b518383f960f` FOREIGN KEY (`productDiscountId`) REFERENCES `product_discount` (`id`),
  CONSTRAINT `FK_9ec46e48f2deb62dc1c3022eab8` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`),
  CONSTRAINT `FK_c1877e424f93bb1f138e3935d24` FOREIGN KEY (`productId`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listed_order`
--

LOCK TABLES `listed_order` WRITE;
/*!40000 ALTER TABLE `listed_order` DISABLE KEYS */;
INSERT INTO `listed_order` VALUES (1,NULL,1,1220.00,1220.00,NULL,1,4,NULL),(2,NULL,1,550.00,550.00,NULL,1,5,NULL),(3,NULL,1,1220.00,1220.00,NULL,2,4,NULL),(4,NULL,2,48.00,96.00,NULL,2,3,NULL),(5,NULL,1,1220.00,1220.00,NULL,3,4,NULL);
/*!40000 ALTER TABLE `listed_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketing_contents`
--

DROP TABLE IF EXISTS `marketing_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_contents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `category` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_219c9f93bb8b780734e07dfc166` (`category`),
  KEY `FK_352067f7d029bf257996edc0b42` (`product_id`),
  KEY `FK_e7b8d0adc203dd94600a59c519c` (`vendor_id`),
  CONSTRAINT `FK_219c9f93bb8b780734e07dfc166` FOREIGN KEY (`category`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_352067f7d029bf257996edc0b42` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `FK_e7b8d0adc203dd94600a59c519c` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_contents`
--

LOCK TABLES `marketing_contents` WRITE;
/*!40000 ALTER TABLE `marketing_contents` DISABLE KEYS */;
INSERT INTO `marketing_contents` VALUES (7,'grwkgneruowghro',7,15,2),(9,'ESAW Pathology is an advanced digital pathology management solution designed to simplify and optimize diagnostic operations. It enables pathology labs, diagnostic centers, and healthcare professionals to manage patient records, test reports, billing, and workflows efficiently through a secure and user-friendly platform.\r\n\r\nWith automation, accuracy, and reliability at its core, ESAW Pathology reduces manual errors, speeds up report generation, and enhances patient care. The system supports seamless data management, real-time access to reports, and improved communication between labs, doctors, and patients.',10,17,4),(10,'Why Choose Our Yoga Classes\r\n\r\nExperienced & certified yoga instructors\r\n\r\nPrograms for all age groups\r\n\r\nTherapeutic and wellness-focused approach\r\n\r\nFlexible schedules & affordable plans\r\n\r\nOnline & offline class options\r\n\r\nPeaceful, supportive learning environment\r\n\r\nStart your journey toward a healthier body and calmer mind—because wellness is not a luxury, it’s a lifestyle.',8,28,3),(11,'Key Benefits of Pranayama\r\n\r\n1)Reduces stress, anxiety & mental fatigue\r\n2)Improves breathing capacity & oxygen flow\r\n3)Enhances focus, memory & emotional stability\r\n4)Supports BP, asthma & respiratory health\r\n5)Boosts immunity & overall vitality\r\n\r\nWhy Choose Our Pranayama Sessions\r\n\r\n1)Certified & experienced instructors\r\n2)techniques for beginners\r\n3)Safe, guided & result-oriented practice\r\n4)Online & offline sessions available\r\n5)Suitable for all age groups',8,29,3),(12,'Mechanical Tension and Microtrauma: Resistance training, such as lifting weights, subjects muscle tissue to mechanical tension and causes tiny micro-tears (microtrauma) in the muscle fibers.',7,30,2);
/*!40000 ALTER TABLE `marketing_contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  `orderStatus` enum('DRAFTED','PENDING','CONFIRMED','PROCESSING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFTED',
  `paymentStatus` enum('PENDING','PAID','PARTIAL','FAILED') NOT NULL DEFAULT 'PENDING',
  `deliveryDate` date DEFAULT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `grandTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `customerId` int NOT NULL,
  `vendorId` int DEFAULT NULL,
  `communityId` int NOT NULL,
  `vendorSubscriptionPlanId` int DEFAULT NULL,
  `deliverySlotId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_124456e637cca7a415897dce659` (`customerId`),
  KEY `FK_ac1293b8024ff05e963d82df453` (`vendorId`),
  KEY `FK_157bab8095c6eef36d1a2d6ec55` (`communityId`),
  KEY `FK_0b91f2de7262c3ce1fc4a283974` (`vendorSubscriptionPlanId`),
  KEY `FK_0fa1614444e15a4baa377d43365` (`deliverySlotId`),
  CONSTRAINT `FK_0b91f2de7262c3ce1fc4a283974` FOREIGN KEY (`vendorSubscriptionPlanId`) REFERENCES `vendor_subscription_plan` (`id`),
  CONSTRAINT `FK_0fa1614444e15a4baa377d43365` FOREIGN KEY (`deliverySlotId`) REFERENCES `delivery_slots` (`id`),
  CONSTRAINT `FK_124456e637cca7a415897dce659` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`),
  CONSTRAINT `FK_157bab8095c6eef36d1a2d6ec55` FOREIGN KEY (`communityId`) REFERENCES `community` (`id`),
  CONSTRAINT `FK_ac1293b8024ff05e963d82df453` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,'2026-01-13 06:58:37',NULL,'DRAFTED','PENDING',NULL,0,1770.00,15,1,1,3,4),(2,'2026-01-13 09:23:31',NULL,'DRAFTED','PENDING',NULL,0,1316.00,15,1,1,3,6),(3,'2026-01-13 09:50:46',NULL,'COMPLETED','PENDING',NULL,0,1220.00,15,1,1,1,4);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `method` enum('ONLINE','OFFLINE') NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `referenceNote` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_d09d285fe1645cd2f0db811e293` (`orderId`),
  CONSTRAINT `FK_d09d285fe1645cd2f0db811e293` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_configuration`
--

DROP TABLE IF EXISTS `price_configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_configuration` (
  `label` varchar(50) NOT NULL,
  `value` float NOT NULL,
  PRIMARY KEY (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_configuration`
--

LOCK TABLES `price_configuration` WRITE;
/*!40000 ALTER TABLE `price_configuration` DISABLE KEYS */;
/*!40000 ALTER TABLE `price_configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `productUrl` varchar(255) NOT NULL,
  `measurementUnit` varchar(255) NOT NULL,
  `measurementValue` varchar(255) NOT NULL,
  `serviceOfferingServiceCode` varchar(10) DEFAULT NULL,
  `vendorId` int DEFAULT NULL,
  `vendorSubscriptionPlanId` int DEFAULT NULL,
  `category` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_921582066aa70b502e78ea92012` (`vendorId`),
  KEY `FK_987e108e9fb96e57aed1fa3e51c` (`vendorSubscriptionPlanId`),
  KEY `FK_d71ac3a30622a475df871b55130` (`category`),
  KEY `FK_7a8320f722328fe38bc617c6dc1` (`serviceOfferingServiceCode`),
  CONSTRAINT `FK_7a8320f722328fe38bc617c6dc1` FOREIGN KEY (`serviceOfferingServiceCode`) REFERENCES `service_offering` (`serviceCode`),
  CONSTRAINT `FK_921582066aa70b502e78ea92012` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`),
  CONSTRAINT `FK_987e108e9fb96e57aed1fa3e51c` FOREIGN KEY (`vendorSubscriptionPlanId`) REFERENCES `vendor_subscription_plan` (`id`),
  CONSTRAINT `FK_d71ac3a30622a475df871b55130` FOREIGN KEY (`category`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Nandini Curd','Nandini Curd, 500 g Pouch','https://freshwayz.dexpertsystems.com/uploads/1766133891075-995830909.webp','GM','500',NULL,1,1,4),(2,'Amul Milk','Amul Slim \'N\' Trim Double Toned Fresh Milk 500 ml','https://freshwayz.dexpertsystems.com/uploads/1766123455921-671983102.webp','ML','500',NULL,1,1,4),(3,'Aashirvaad Wheat Atta','Aashirvaad Wheat Atta, 1 KG','https://5.imimg.com/data5/ANDROID/Default/2022/4/KR/MI/RS/1600400/prod-20220428-1059022370213558067768775-jpg-1000x1000.jpg','KG','1',NULL,1,1,1),(4,'Daawat Traditional Basmati White Rice','Daawat Traditional Basmati White Rice - Authentic Extra Long Grain Basmati Rice - 5Kg Bag','https://m.media-amazon.com/images/I/41qb2ccHt6L._SY300_SX300_QL70_FMwebp_.jpg','KG','5',NULL,1,1,1),(5,'Oregano oil ','Oregano oil 10 ml Biomus','https://chemmarkt.de/cdn/shop/files/426b8a7a796b74632d15ff94841db9dc.jpg?v=1751373341','ML','10',NULL,1,1,3),(6,'Indus Valley','Indus Valley Bio Organic Cold Pressed Oil - Sweet Almond 100 ml','https://cdn.netmeds.tech/v2/plain-cake-860195/netmed/wrkr/products/pictures/item/free/resize-w:400/wczHgDH3sD-indus_valley_bio_organic_cold_pressed_oil_sweet_almond_100_ml_0_1.jpg','ML','100',NULL,1,1,3),(7,'Premium Jumbo Almond','Jumbo Almonds are rich in Qualities and benefits , Jumbo almonds help in reducing the Hunger and reduce the intake of calories .These Almonds can be used to Extract oil and Milk , Jumbo Almonds are long in nature and Extra bit in sweetness.','https://dryfruithouse.com/admin/uploadImages/DRYF103_0.jpg','KG','1',NULL,1,1,2),(8,'Cashew Nuts (kaju) Jumbo Sized','Indulge in the luxurious size and rich flavor of our jumbo cashew. Each bite delivers a delightful crunch and buttery texture, making it a premium choice for snacking.','https://dryfruithouse.com/admin/uploadImages/DRYF110_0.jpg','KG','1',NULL,1,1,2),(9,'Apple - Red Delicious, Premium','Known for its iconic deep red color and classic heart shape, the Red Delicious apple has a mildly sweet flavor and firm, crisp texture. It is best enjoyed fresh as a snack or added to salads for a burst of crunch.','https://www.bbassets.com/media/uploads/p/m/40033819_35-fresho-apple-shimla.jpg','KG','1',NULL,1,1,5),(10,'Banana - Robusta, Organically Grown','Robusta bananas are a popular and versatile everyday fruit. They have a creamy texture and sweet flavor, making them ideal for smoothies, baking, or enjoying on their own. This listing is for organically grown bananas.','https://www.bbassets.com/media/uploads/p/l/40023475_7-fresho-banana-robusta-organically-grown.jpg','KG','1',NULL,1,1,5),(11,' fresho! 10 mins fresho! Mushrooms','Fresho! mushrooms, especially Button and Oyster, are fresh, hand-picked varieties known for their mild flavor and versatility.','https://www.bbassets.com/media/uploads/p/l/10000273_18-fresho-mushrooms-button.jpg','GM','200',NULL,1,1,5),(12,' Broccoli','Nutrient-packed green broccoli with crisp, \"tree-like\" florets and a tender, edible stalk. A versatile and healthy addition to any meal, whether steamed, roasted, or raw','https://www.bbassets.com/media/uploads/p/l/10000062_25-fresho-broccoli.jpg','GM','200-300',NULL,1,1,6),(13,'Roasted Makhana','A light-as-air, crunchy snack packed with protein, fiber, and antioxidants. They support heart health and digestion, are low in calories, and come in flavors like classic Pink Salt, Peri Peri, or Cheese.','https://static.dilligrocery.com/90-large_default/fox-nuts-makhana.jpg','GM','100',NULL,1,1,9),(14,'https://static.dilligrocery.com/90-large_default/fox-nuts-makhana.jpg','Crunchy roasted chickpeas or chana (Indian black chickpea) laced with spicy masala or other seasonings. They offer a healthy balance of carbohydrates, protein, and fiber, making them an ideal, high-protein snack.','https://images.healthshots.com/healthshots/en/uploads/2022/09/19165004/roasted-chana-1600x900.jpg','GM','100',NULL,1,1,9),(15,'Personal Training','Personal Training','https://freshwayz.dexpertsystems.com/uploads/1768291236733-416530995.jpg','NUMBER','12',NULL,2,1,7),(16,'V.D.R.L. Rotator','A V.D.R.L. rotator is a laboratory instrument that provides a specific, uniform, orbital circular motion to mix samples for diagnostic tests, most commonly the Venereal Disease Research Laboratory (VDRL) test for syphilis.','https://5.imimg.com/data5/SELLER/Default/2023/8/335629324/SO/FH/ZR/1141243/v-d-r-l-rotator-1000x1000.jpg','NUMBER','1',NULL,4,1,10),(17,'ESAW 2500x Pathological Doctor Compound Student Binocular Microscope for Laboratory, Magnification 40x to 2500x (Field 18mm)','ESAW generally refers to Engineering Science Apparatus Workshop, a major Indian manufacturer and exporter of scientific instruments for education and research (like microscopes, meters, lab glassware, physics equipment).','https://m.media-amazon.com/images/I/61MstERkLZL._SY500_.jpg','NUMBER','1',NULL,4,1,10),(18,'Coconut Water','Coconut water is the clear, naturally sweet liquid from young green coconuts, valued as a hydrating, low-calorie drink rich in electrolytes (potassium, magnesium, sodium), vitamins, and amino acids.','https://distrapi.blob.core.windows.net/strapi-uploads/assets/Coconut_Water_Juice_bf6377e088.jpg','LITRE','1',NULL,1,1,12),(19,'Real Fruit Power Mixed Fruit Juice','A popular blended fruit juice drink, typically made from concentrate, often contains added sugar. Endorsed for its \"fruit power\" but not always 100% juice.','https://www.bbassets.com/media/uploads/p/l/40214941_6-real-activ-fruit-power-coconut-water.jpg','LITRE','1',NULL,1,1,12),(20,'Lettuce Salad Box','A basic mix of fresh, low-calorie greens, high in vitamins and fiber, for light meals.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBCcvFlKuPVOatzSTCVdWbxOB-5Kdl2JvfPg&s','GM','100',NULL,1,1,13),(21,'Trikaya Salad','Trikaya salads ready-to-eat salad mixes featuring various fresh lettuces with added ingredients like cherry tomatoes, red cabbage, pomegranate, and raisins, often accompanied by a sesame-honey dressing for a sweet, crisp, and nutritious meal.','https://www.bbassets.com/media/uploads/p/l/40152795_1-trikaya-salad-mini-ready-to-eat.jpg','GM','50',NULL,1,1,13),(22,'Chana Masala with Roti/Brown Rice','Chickpeas cooked in a flavorful, protein-rich curry with vegetables, served with whole wheat rotis or brown rice','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTF3BoLl8HT35CEJG7dIb8iOmYV7i4V1-iTg&s','GM','300',NULL,1,1,14),(23,'Grilled Paneer & Veggies','Cottage cheese (paneer) grilled in herbs and lime, served with sautéed exotic vegetables or brown rice. High in protein and fiber.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBhOgpINNJKSm3N3BZ9xvB2YerVbP8aOlG0Q&s','GM','200',NULL,1,1,14),(24,'Sugar Free Ice Cream-Vanilla','Sugar-free vanilla ice cream is a creamy, low-calorie frozen dessert that delivers classic vanilla flavor without the use of traditional sugar. ','https://www.bbassets.com/media/uploads/p/l/40013808_3-amul-sugar-free-ice-cream-vanilla-with-chocolate-sauce.jpg','ML','125',NULL,1,1,15),(25,' Sugar Free Ice Cream - Shahi Anjeer, With Chocolate Sauce',' Sugar Free Ice Cream - Shahi Anjeer, With Chocolate Sauce, 125 ml','https://www.bbassets.com/media/uploads/p/l/40091814_3-amul-sugar-free-ice-cream-anjeer-with-chocolate-sauce.jpg','ML','125',NULL,1,1,15),(26,'Millet Pizza Base Organic','Finally a guilt-free pizza. Introducing to you the only pizza base in India that is made from millets, introducing to you our delicious Organic Millet Pizza Base. Our pizza base is pre-baked, does not contain any yeast.','https://milletamma.com/cdn/shop/products/MilletPizzaBase.png?v=1738404242','GM','200',NULL,1,1,11),(27,'Little Millet Instant Noodles','Pasta and noodles are a fave. Comforting, easy-to-cook, and delicious. But if you are concerned about maida and other harmful content then MilletAmma got your back! MilletAmma has come up with Little Millet instant noodles. ','https://milletamma.com/cdn/shop/products/14a.jpg?v=1738411663','GM',' 175',NULL,1,1,11),(28,'Beginner Yoga Program','Ideal for newcomers, focusing on basic postures, breathing techniques, and flexibility to build a strong foundation.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9UpCKutP2yCXEpd8nU4gOO7yHOUxCjUDhjw&s','MONTH','1',NULL,3,1,8),(29,'Meditation & Pranayama','Mind-focused practices to improve concentration, emotional balance, stress management, and inner peace.','https://www.rishikulyogshalarishikesh.com/blog/wp-content/uploads/2024/09/woman-practices-yoga-pranayama-breath-control-683x1024.jpg','MONTH','1',NULL,3,1,8),(30,'Muscle Building Plan','Muscle building, known scientifically as muscular hypertrophy, is the physiological process of increasing the size of skeletal muscles through the growth in size of their component cells.','https://freshwayz.dexpertsystems.com/uploads/1768298126161-654141385.jpeg','NUMBER','45',NULL,2,1,7);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_discount`
--

DROP TABLE IF EXISTS `product_discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_discount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('PERCENTAGE','FLAT','BOGO') NOT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `buyQuantity` int DEFAULT NULL,
  `getQuantity` int DEFAULT NULL,
  `minCartQuantity` int NOT NULL,
  `startDate` timestamp NOT NULL,
  `endDate` timestamp NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `productId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9681277424b779691ba39cd3537` (`productId`),
  CONSTRAINT `FK_9681277424b779691ba39cd3537` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_discount`
--

LOCK TABLES `product_discount` WRITE;
/*!40000 ALTER TABLE `product_discount` DISABLE KEYS */;
INSERT INTO `product_discount` VALUES (1,'PERCENTAGE',50.00,0,0,1,'2026-01-12 18:30:00','2026-01-25 18:30:00',1,15),(2,'PERCENTAGE',50.00,0,0,1,'2026-01-12 18:30:00','2026-01-12 18:30:00',1,17);
/*!40000 ALTER TABLE `product_discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_offering`
--

DROP TABLE IF EXISTS `service_offering`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_offering` (
  `serviceCode` varchar(10) NOT NULL,
  `serviceName` varchar(20) NOT NULL,
  `description` varchar(150) NOT NULL,
  PRIMARY KEY (`serviceCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_offering`
--

LOCK TABLES `service_offering` WRITE;
/*!40000 ALTER TABLE `service_offering` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_offering` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `startDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endDate` timestamp NULL DEFAULT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `customerId` int DEFAULT NULL,
  `planId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e4543f99d629cf2c04fe9332e30` (`customerId`),
  KEY `FK_6b6d0e4dc88105a4a11103dd2cd` (`planId`),
  CONSTRAINT `FK_6b6d0e4dc88105a4a11103dd2cd` FOREIGN KEY (`planId`) REFERENCES `vendor_subscription_plan` (`id`),
  CONSTRAINT `FK_e4543f99d629cf2c04fe9332e30` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `userTypeId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  KEY `FK_29f29dffce2845a1abc901d4e85` (`userTypeId`),
  CONSTRAINT `FK_29f29dffce2845a1abc901d4e85` FOREIGN KEY (`userTypeId`) REFERENCES `user_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2,'Nilesh','nilesh@gmail.com','96644085446','2026-01-13 11:35:04.142078','2026-01-13 11:35:04.142078',7);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_type`
--

DROP TABLE IF EXISTS `user_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `typeName` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1e18082ddcef682886e9939451` (`typeName`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_type`
--

LOCK TABLES `user_type` WRITE;
/*!40000 ALTER TABLE `user_type` DISABLE KEYS */;
INSERT INTO `user_type` VALUES (1,'Customer','customer account. end user of this application','2025-11-15 16:42:32.869145','2025-11-15 16:42:32.869145'),(2,'Vendor',NULL,'2026-01-13 08:45:11.355673','2026-01-13 08:45:11.355673'),(3,'GymVendor',NULL,'2026-01-13 08:45:11.357490','2026-01-13 08:45:11.357490'),(4,'YogaVendor',NULL,'2026-01-13 08:45:11.359271','2026-01-13 08:45:11.359271'),(5,'PathalogyVendor',NULL,'2026-01-13 08:45:11.360851','2026-01-13 08:45:11.360851'),(6,'MilletsVendor',NULL,'2026-01-13 08:45:11.362435','2026-01-13 08:45:11.362435'),(7,'Admin',NULL,'2026-01-13 08:45:33.986121','2026-01-13 08:45:33.986121');
/*!40000 ALTER TABLE `user_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor`
--

DROP TABLE IF EXISTS `vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gstNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `ownerName` varchar(255) DEFAULT NULL,
  `userTypeId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_aba8090534d8b8b8845784086c` (`email`),
  KEY `FK_29787c11a86832dd02e64e27411` (`userTypeId`),
  CONSTRAINT `FK_29787c11a86832dd02e64e27411` FOREIGN KEY (`userTypeId`) REFERENCES `user_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor`
--

LOCK TABLES `vendor` WRITE;
/*!40000 ALTER TABLE `vendor` DISABLE KEYS */;
INSERT INTO `vendor` VALUES (1,'Freshways','Freshways@gm.com',NULL,NULL,'Sandeep Sir',7),(2,'ADITYA FITNESS CLASSES','adityavajale@gmail.com','ADIU12221YUUUUUU','Ashoka society,108/A,vegnsarkar academy','Aditya vajale',2),(3,'Paresh Yoga Classes','paresh@gmail.com','78674ADD4FFFFWWE','Maharashtra,Chinchwad Goan , Pune','Paresh',2),(4,'Vivek Pathology','vivek@gmail.com','KHDFDVA3872423HA','Mumbai, kalyan','Vivek',5),(5,'Milletes','umesh@gmail.com','7878777777777777','Ravet Pune','Umesh Jaiswal',2);
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_categories`
--

DROP TABLE IF EXISTS `vendor_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_categories` (
  `vendor_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`vendor_id`,`category_id`),
  KEY `IDX_b9f4335af4cf8270a371567930` (`vendor_id`),
  KEY `IDX_7f910d67550fd7a5dfc6501c63` (`category_id`),
  CONSTRAINT `FK_7f910d67550fd7a5dfc6501c63c` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_b9f4335af4cf8270a3715679302` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_categories`
--

LOCK TABLES `vendor_categories` WRITE;
/*!40000 ALTER TABLE `vendor_categories` DISABLE KEYS */;
INSERT INTO `vendor_categories` VALUES (2,7),(3,8),(4,10);
/*!40000 ALTER TABLE `vendor_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_subscription_plan`
--

DROP TABLE IF EXISTS `vendor_subscription_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_subscription_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL,
  `description` varchar(100) NOT NULL,
  `vendorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e57120e444d115ce4c5c7c22235` (`vendorId`),
  CONSTRAINT `FK_e57120e444d115ce4c5c7c22235` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_subscription_plan`
--

LOCK TABLES `vendor_subscription_plan` WRITE;
/*!40000 ALTER TABLE `vendor_subscription_plan` DISABLE KEYS */;
INSERT INTO `vendor_subscription_plan` VALUES (1,'Daily','Product Delivered on daily basis like milk',1),(2,'Weekly','Product Delivered twice in a week basis like Fruits',1),(3,'Monthly ','Product Delivered once in week basis like Floor,Beans,Dals',1),(4,'45 Days','45 days',2);
/*!40000 ALTER TABLE `vendor_subscription_plan` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 18:42:03
