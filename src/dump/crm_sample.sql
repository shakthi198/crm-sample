-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2026 at 12:35 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crm_sample`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_guid`, `action`, `module`, `created_at`) VALUES
(1, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'System Login', 'Authentication', '2026-02-17 06:26:19'),
(2, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Profile Updated', 'Users', '2026-02-17 06:26:19'),
(3, '0b2b2746-0738-11f1-9c42-e21ad8f02b04', 'System Login', 'Authentication', '2026-02-17 06:26:19'),
(4, '0b2b2746-0738-11f1-9c42-e21ad8f02b04', 'Profile Updated', 'Users', '2026-02-17 06:26:20'),
(5, '4034e800-0764-11f1-922b-c59ab5bb8879', 'System Login', 'Authentication', '2026-02-17 06:26:20'),
(6, '4034e800-0764-11f1-922b-c59ab5bb8879', 'Profile Updated', 'Users', '2026-02-17 06:26:20'),
(7, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 06:28:05'),
(8, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 06:29:40'),
(9, 'df9364499c37f8e266cdc6d191ac3ef4', 'User Created', 'Users', '2026-02-17 06:58:53'),
(10, 'b722aa0863414166067585d5da34292e', 'Logged In', 'Authentication', '2026-02-17 06:59:17'),
(11, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 07:02:50'),
(12, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 07:03:44'),
(13, 'df9364499c37f8e266cdc6d191ac3ef4', 'User Updated', 'Users', '2026-02-17 07:15:41'),
(14, 'df9364499c37f8e266cdc6d191ac3ef4', 'User Updated', 'Users', '2026-02-17 07:15:55'),
(15, 'ADM-USER-001', 'Logged In', 'Authentication', '2026-02-17 07:16:19'),
(16, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 07:16:36'),
(17, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-17 07:41:04'),
(18, '46cbf2bd-0af1-11f1-9a85-94280dc8c684', 'Logged In', 'Authentication', '2026-02-17 07:41:26'),
(19, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 07:43:25'),
(20, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-17 09:11:15'),
(21, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:25:36'),
(22, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:30:52'),
(23, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:31:10'),
(24, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:49:42'),
(25, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:50:06'),
(26, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 09:59:36'),
(27, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 10:32:51'),
(28, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 10:33:07'),
(29, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-17 10:33:34'),
(30, '46cbf2bd-0af1-11f1-9a85-94280dc8c684', 'Logged In', 'Authentication', '2026-02-17 10:33:43'),
(31, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 12:42:35'),
(32, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-17 12:47:31'),
(33, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-18 04:51:39'),
(34, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-18 04:51:54'),
(35, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-18 04:56:15'),
(36, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 05:32:21'),
(37, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 06:02:11'),
(38, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:02:27'),
(39, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:04:47'),
(40, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:09:12'),
(41, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:10:25'),
(42, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:11:41'),
(43, 'df9364499c37f8e266cdc6d191ac3ef4', 'User Created', 'Users', '2026-02-20 06:16:32'),
(44, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:16:53'),
(45, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:21:32'),
(46, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:21:37'),
(47, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:23:02'),
(48, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:23:06'),
(49, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 06:40:03'),
(50, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:40:23'),
(51, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:41:02'),
(52, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:41:07'),
(53, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:41:11'),
(54, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 06:41:17'),
(55, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 09:35:38'),
(56, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 10:04:41'),
(57, 'df9364499c37f8e266cdc6d191ac3ef4', 'Logged In', 'Authentication', '2026-02-20 10:36:36'),
(58, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 10:45:29'),
(59, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 10:45:42'),
(60, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 10:47:51'),
(61, '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'Logged In', 'Authentication', '2026-02-20 10:58:59');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `employee_guid` char(36) NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `working_hours` decimal(5,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `attendance_guid`, `organization_guid`, `employee_guid`, `attendance_date`, `check_in_time`, `check_out_time`, `working_hours`, `status`, `created_at`, `is_active`) VALUES
(1, '09baeab1-c5f9-43ac-8181-027d6d06bb61', '49c4c122-0718-11f1-9c42-e21ad8f02b04', '67a77f31-0cba-11f1-a6cc-48ea62949a34', '2026-02-19', '09:00:00', '18:00:00', 9.00, 'Present', '2026-02-19 07:05:50', 1),
(2, 'ba2d00c0-88c1-47d9-9324-649b10539145', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'd1ff1be7-0d60-11f1-9965-48ea62949a34', '2026-02-19', '09:00:00', '18:00:00', 9.00, 'Present', '2026-02-19 07:18:50', 1),
(3, '5f4c5926-0f6c-473f-a3e3-5d9ab970b9a1', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e9fa89-0d62-11f1-9965-48ea62949a34', '2026-02-19', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:30:59', 1),
(4, '3207ca32-cc3e-4446-9e53-a0cb834249ba', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e9fc9d-0d62-11f1-9965-48ea62949a34', '2026-02-19', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:30:59', 1),
(5, '45a9aa7c-6551-4aa7-9388-9f5bf467c9a0', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e9fd76-0d62-11f1-9965-48ea62949a34', '2026-02-19', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:30:59', 1),
(6, '76ba65f0-0405-4725-ab1b-07530f40763a', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e3f09b-0d62-11f1-9965-48ea62949a34', '2026-02-19', '09:00:00', '18:00:00', 9.00, 'Present', '2026-02-19 07:31:08', 1),
(7, '15cc413f-7063-4d05-909d-f7153617bb80', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e9fe35-0d62-11f1-9965-48ea62949a34', '2026-02-19', '09:00:00', '18:00:00', 9.00, 'Present', '2026-02-19 07:31:08', 1),
(8, '9c2df560-680f-40f4-bb8b-cc5b41a00dc8', '49c4c122-0718-11f1-9c42-e21ad8f02b04', '67a77f31-0cba-11f1-a6cc-48ea62949a34', '2026-02-18', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:31:36', 1),
(9, '3693d9eb-779b-4acb-a3fb-2dee523b2568', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'd1ff1be7-0d60-11f1-9965-48ea62949a34', '2026-02-18', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:31:36', 0),
(10, '08243c13-3c50-475c-bcb6-63ce5d11d15f', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'b6e3f09b-0d62-11f1-9965-48ea62949a34', '2026-02-18', '00:00:00', '00:00:00', 0.00, 'Absent', '2026-02-19 07:31:36', 1),
(11, '240b3450-9543-4197-b5c3-d39a0d547a1b', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'adc6e911-0cac-11f1-bbbb-14d424a2ecfa', '2026-02-19', '09:00:00', '18:00:00', 9.00, 'Present', '2026-02-19 08:36:57', 1);

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `budget_guid` char(36) NOT NULL,
  `lead_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `estimated_amount` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `final_amount` decimal(15,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'Pending',
  `date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`budget_guid`, `lead_guid`, `organization_guid`, `estimated_amount`, `discount`, `final_amount`, `status`, `date`, `created_at`, `is_active`) VALUES
('9cfb921d-4397-4fe8-9569-459ba6de177c', '8c5ea711-9c03-4ce0-942c-fa0dc2b2cc8c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1000.00, 20.00, 980.00, 'Approved', NULL, '2026-02-18 05:12:21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `client_guid` char(36) NOT NULL,
  `lead_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `contract_file` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `assigned_to_guid` char(36) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`client_guid`, `lead_guid`, `organization_guid`, `contract_file`, `start_date`, `assigned_to_guid`, `remarks`, `created_at`, `is_active`, `status`) VALUES
('373bd9a5-e1ab-4062-9613-911ac0dd7d63', '8c5ea711-9c03-4ce0-942c-fa0dc2b2cc8c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'uploads/contracts/1771392236_Screenshot2026-02-18102633.png', '2026-02-18', NULL, NULL, '2026-02-18 05:23:56', 1, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `followups`
--

CREATE TABLE `followups` (
  `followup_guid` char(36) NOT NULL,
  `lead_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `assigned_to_guid` char(36) DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `followups`
--

INSERT INTO `followups` (`followup_guid`, `lead_guid`, `organization_guid`, `type`, `date`, `time`, `status`, `assigned_to_guid`, `outcome`, `created_at`, `is_active`) VALUES
('0d4f02420c59fd8338dc4c9bc23fa34e', '8c5ea711-9c03-4ce0-942c-fa0dc2b2cc8c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Call', '2026-02-18', '11:16:00', 'Pending', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'nice', '2026-02-18 01:17:00', 0),
('35d5f09f112a7a3d94223025ec4a4bb3', '8c5ea711-9c03-4ce0-942c-fa0dc2b2cc8c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Call', '2026-02-19', '11:58:00', 'Scheduled', '49c4c122-0718-11f1-9c42-e21ad8f02b04', 'done', '2026-02-18 01:59:08', 1);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) NOT NULL,
  `lead_guid` char(36) NOT NULL,
  `organization_guid` char(36) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `assigned_to` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `admin_guid` char(36) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_guid`, `organization_guid`, `client_name`, `phone`, `status`, `assigned_to`, `created_at`, `is_active`, `admin_guid`, `email`, `company`, `source`, `remarks`) VALUES
(20, '8c5ea711-9c03-4ce0-942c-fa0dc2b2cc8c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'sample_lead', '9876543210', 'New', '49c4c122-0718-11f1-9c42-e21ad8f02b04', '2026-02-18 05:10:06', 1, NULL, 'sample@gmail.com', 'hike creation', 'Website', 'good');

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint(20) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `user_guid` char(36) DEFAULT NULL,
  `admin_guid` char(36) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `physical_address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `organization_guid`, `company_name`, `status`, `created_at`, `is_active`, `user_guid`, `admin_guid`, `email`, `phone_number`, `physical_address`) VALUES
(1, '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'jothi', 'Active', '2026-02-17 05:14:43', 1, '49c4c122-0718-11f1-9c42-e21ad8f02b04', '49c4c1c6-0718-11f1-9c42-e21ad8f02b04', 'jothi@gmail.com', '8940066871', 'afsdjhgofnlglfg'),
(2, '883cdc73-5de1-4591-aad8-4407d42f323b', 'sample_org', 'Active', '2026-02-18 16:09:58', 1, '49c4c122-0718-11f1-9c42-e21ad8f02b04', NULL, 'org@gmail.com', '987654345', 'rgrhtyjy');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `module` varchar(50) NOT NULL,
  `full_access` tinyint(1) DEFAULT 0,
  `view` tinyint(1) DEFAULT 0,
  `edit` tinyint(1) DEFAULT 0,
  `delete` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_guid`, `organization_guid`, `module`, `full_access`, `view`, `edit`, `delete`, `is_active`, `created_at`) VALUES
('07db4eae4031dd3987abdc4b3dcdb68e', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('0ece21eac6c281d4f04bdc049dbc7014', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Roles', 1, 1, 1, 1, 1, '2026-02-16 18:28:12'),
('111111895810895a9fbacad9934e07d0', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Clients', 1, 1, 1, 1, 1, '2026-02-13 11:21:06'),
('2085c7f8389c70067185b7657072660f', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Dashboard', 1, 1, 1, 1, 1, '2026-02-19 06:56:19'),
('21aebf2e89961df6fc246b1c0302075c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Clients', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('292cbeb55db2b22f632bfe418311e569', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Users', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('296bb215d7840e0831bd72e36166fd27', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Organization', 1, 1, 1, 1, 1, '2026-02-16 18:28:12'),
('302efa50da52b37bdf3422ec86b83471', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Organization', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('372f42371ce222fedfd2862db99e836b', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Clients', 1, 1, 1, 1, 1, '2026-02-19 06:56:19'),
('38cebd1b2f5273ad10dab8c15d78d834', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Reports', 1, 1, 1, 1, 1, '2026-02-16 18:28:12'),
('38f30e120b1bf7705f8420d6fcfc73c7', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Followups', 1, 1, 1, 1, 1, '2026-02-16 18:28:12'),
('41155e6819adc124f2e7479a9ba1380d', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Followups', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('4351e7bc28b3477b82c1a4c6d56a0a0d', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Organization', 1, 1, 1, 1, 1, '2026-02-18 19:58:52'),
('52f4af9bf544c295ab1db6f1479f5044', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Budgets', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('5c904949f47e93c5f058b6f645bc9661', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Clients', 1, 1, 1, 1, 1, '2026-02-19 06:17:02'),
('617e53e3619e68b4170aca5ec8c0f7d2', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Dashboard', 1, 1, 1, 1, 1, '2026-02-16 18:28:12'),
('6363007113c2d8f689d60fd55436464c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Settings', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('6d31b759992bc30da569ead6a19da612', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Users', 1, 1, 1, 1, 1, '2026-02-19 06:17:02'),
('6df9d949-076a-11f1-922b-c59ab5bb8879', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Leads', 0, 1, 1, 0, 1, '2026-02-11 16:55:11'),
('6df9e4dd-076a-11f1-922b-c59ab5bb8879', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Clients', 0, 1, 0, 0, 1, '2026-02-11 16:55:11'),
('6df9e635-076a-11f1-922b-c59ab5bb8879', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Budgets', 1, 1, 1, 1, 1, '2026-02-11 16:55:11'),
('764e410f7cfc058d3adb9e402a30c22b', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Clients', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('8d02e47f6883761b789d4a3f96a65925', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 1, 1, 1, 1, 1, '2026-02-19 06:17:02'),
('96c410a23cdf7bc46954142d1c25b6b3', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Reports', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('a021da67f691831f1526fab368e487dd', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Followups', 1, 1, 1, 1, 1, '2026-02-19 06:56:19'),
('a084456af8756707c6ac22553d354bb5', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Followups', 1, 1, 1, 1, 1, '2026-02-19 06:17:02'),
('b5467062f3f0f596100aabfc2271eae8', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Followups', 1, 1, 1, 1, 1, '2026-02-18 19:58:52'),
('b7d3259def598594d14b7857ff3ab71d', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Settings', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('c1ebeda0d073179ea1ab5bfd22fd47f6', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Budgets', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('c59c712c5cd4ca3867f30ad6d96a037c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 1, 1, 1, 1, 1, '2026-02-19 06:56:19'),
('c916d830b7ce6e80b4f9258c2a88540d', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Budgets', 1, 1, 1, 1, 1, '2026-02-19 06:56:19'),
('cc857b5fa8bd0ee8b0397acdd864da3d', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Users', 1, 1, 1, 1, 1, '2026-02-13 11:21:06'),
('cfa2a5c03f1fe582a5cb38e3fff30153', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Followups', 1, 1, 1, 1, 1, '2026-02-18 05:14:48'),
('d1d404e78dd17997843d3c6558466004', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Leads', 1, 1, 1, 1, 1, '2026-02-13 11:21:51'),
('d2335b99176e084ce844958ff754b5a9', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('d761cf09ad6178998240bc61eb66b7e3', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Budgets', 1, 1, 1, 1, 1, '2026-02-18 19:58:52'),
('d9f2448dceeb681c26c64702076be617', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Users', 1, 1, 1, 1, 1, '2026-02-18 19:58:52'),
('e4f7bed0-0736-11f1-9c42-e21ad8f02b04', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 0, 1, 1, 0, 1, '2026-02-11 10:46:17'),
('e4f7cc07-0736-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Leads', 0, 1, 1, 0, 1, '2026-02-11 10:46:17'),
('e4f7ccca-0736-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Clients', 0, 1, 0, 1, 1, '2026-02-11 10:46:17'),
('e4f7cd1d-0736-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Budgets', 1, 1, 0, 0, 1, '2026-02-11 10:46:17'),
('e6e9276a1f65bd85830eb26c80aacb91', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Budgets', 1, 1, 1, 1, 1, '2026-02-19 06:17:02'),
('f4f897e21d170e1e3e829062ebf765c7', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Organization', 1, 1, 1, 1, 1, '2026-02-18 19:58:28'),
('fa0fed33f21c00b6a41615a4660557c2', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Leads', 1, 1, 1, 1, 1, '2026-02-18 19:58:52'),
('fb342bc19192828d490888b9ee8dd72c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Clients', 1, 1, 1, 1, 1, '2026-02-18 19:58:52');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_guid`, `organization_guid`, `role_name`, `is_active`, `created_at`, `description`, `is_system`) VALUES
('0cf0ee7b036fdda89039730a63117e63', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'manager', 1, '2026-02-18 09:25:19', 'manger stuffs', 0),
('753da22e-0716-11f1-9c42-e21ad8f02b04', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'Admin', 1, '2026-02-11 10:46:11', 'admin can access everything', 0),
('753dddc6-0716-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Manager', 1, '2026-02-11 10:46:11', NULL, 0),
('81bb3d46-0712-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'Sales', 1, '2026-02-11 10:46:11', '', 0),
('b3e2cd9758db902db5096e8286491151', '753981c5-0716-11f1-9c42-e21ad8f02b04', 'PA', 1, '2026-02-13 11:21:06', 'abcd', 0);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_guid` char(36) NOT NULL,
  `role_guid` char(36) NOT NULL,
  `permission_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_guid`, `role_guid`, `permission_guid`, `organization_guid`, `is_active`, `created_at`) VALUES
('08ea2d93b90c6cf6d2cd5f135be940bc', '753da22e-0716-11f1-9c42-e21ad8f02b04', '764e410f7cfc058d3adb9e402a30c22b', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('0a797171c6ea9e494c7b5c583c27c297', '0cf0ee7b036fdda89039730a63117e63', 'c916d830b7ce6e80b4f9258c2a88540d', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-19 06:56:19'),
('18583e328f9023de0078e9b9eda745f7', '81bb3d46-0712-11f1-9c42-e21ad8f02b04', '111111895810895a9fbacad9934e07d0', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-13 11:21:51'),
('3601ba78fde3d2e00e572a79ad75eb4c', '0cf0ee7b036fdda89039730a63117e63', 'a021da67f691831f1526fab368e487dd', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-19 06:56:19'),
('510c7d132b4d0b0af94242a0cdb46df0', '753da22e-0716-11f1-9c42-e21ad8f02b04', '07db4eae4031dd3987abdc4b3dcdb68e', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('52acdc800add39c59a5b818e2182d649', 'b3e2cd9758db902db5096e8286491151', '6df9e635-076a-11f1-922b-c59ab5bb8879', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-13 15:42:44'),
('5fd2475e9dd6baa5e8fdbe3de16fd7a6', '0cf0ee7b036fdda89039730a63117e63', '372f42371ce222fedfd2862db99e836b', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-19 06:56:19'),
('6eeda36061d258e2fe1e39182701ec3e', '0cf0ee7b036fdda89039730a63117e63', 'c59c712c5cd4ca3867f30ad6d96a037c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-19 06:56:19'),
('7cfd564dd31f389e394a478e2cc9690f', 'b3e2cd9758db902db5096e8286491151', 'cc857b5fa8bd0ee8b0397acdd864da3d', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-13 15:42:44'),
('7e397862ff32f3bf35b6e176552acf0f', '753da22e-0716-11f1-9c42-e21ad8f02b04', '96c410a23cdf7bc46954142d1c25b6b3', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('80e0150952a5c8ff01310e7dc62f0f4b', '753da22e-0716-11f1-9c42-e21ad8f02b04', '302efa50da52b37bdf3422ec86b83471', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('8f8198a8cc6d7eb67906d14891554612', 'b3e2cd9758db902db5096e8286491151', '111111895810895a9fbacad9934e07d0', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-13 15:42:44'),
('9c6e9967007aab2104fe7eaa499116c8', '0cf0ee7b036fdda89039730a63117e63', '2085c7f8389c70067185b7657072660f', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-19 06:56:19'),
('a623e64ffa66c1216dbeadca020b5e10', '753da22e-0716-11f1-9c42-e21ad8f02b04', '52f4af9bf544c295ab1db6f1479f5044', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('b5700897-0755-11f1-9c42-e21ad8f02b04', '753dddc6-0716-11f1-9c42-e21ad8f02b04', 'e4f7bed0-0736-11f1-9c42-e21ad8f02b04', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-11 14:26:52'),
('c3173bb5e3e54b1418119b239599fbb9', '753da22e-0716-11f1-9c42-e21ad8f02b04', 'cfa2a5c03f1fe582a5cb38e3fff30153', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('cc4ceee3ad564e62ae4a27daf625705a', '753da22e-0716-11f1-9c42-e21ad8f02b04', '6363007113c2d8f689d60fd55436464c', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48'),
('d6d6cd3f0983b90571b31abd460e7576', '81bb3d46-0712-11f1-9c42-e21ad8f02b04', 'd1d404e78dd17997843d3c6558466004', '753981c5-0716-11f1-9c42-e21ad8f02b04', 1, '2026-02-13 11:21:51'),
('e7cf4f0fd031d9e1af8a418632f38a1d', '753da22e-0716-11f1-9c42-e21ad8f02b04', '292cbeb55db2b22f632bfe418311e569', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 1, '2026-02-18 05:14:48');

-- --------------------------------------------------------

--
-- Table structure for table `salary_advance`
--

CREATE TABLE `salary_advance` (
  `id` int(11) NOT NULL,
  `employee_guid` varchar(50) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `advance_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `balance_after` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_advance`
--

INSERT INTO `salary_advance` (`id`, `employee_guid`, `organization_guid`, `advance_amount`, `created_at`, `balance_after`) VALUES
(18, 'adc6e911-0cac-11f1-bbbb-14d424a2ecfa', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 10.00, '2026-02-19 17:48:12', 15390.00);

-- --------------------------------------------------------

--
-- Table structure for table `super_admin`
--

CREATE TABLE `super_admin` (
  `sa_id` int(11) NOT NULL,
  `super_admin_guid` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `super_admin`
--

INSERT INTO `super_admin` (`sa_id`, `super_admin_guid`, `username`, `email`, `password`, `full_name`, `is_active`, `created_at`, `updated_at`, `last_login`, `created_by`) VALUES
(1, 'df9364499c37f8e266cdc6d191ac3ef4', 'superadmin', 'superadmin@crm.com', '$2y$10$hkK8y6e6PBxfi2WP1eeVjuKVMXkT/QNN0tLRjrhd.oQi06vExHzFe', 'Main Super Admin', 1, '2026-02-16 05:54:41', '2026-02-20 10:36:36', '2026-02-20 10:36:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `admin_guid` char(36) NOT NULL,
  `organization_guid` char(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_guid` char(36) NOT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `is_active` tinyint(1) DEFAULT 1,
  `inactive_reason` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_guid`, `admin_guid`, `organization_guid`, `name`, `email`, `password`, `role_guid`, `status`, `is_active`, `inactive_reason`, `last_login`, `is_deleted`, `deleted_at`, `created_at`) VALUES
(1, '49c4c122-0718-11f1-9c42-e21ad8f02b04', '49c4c1c6-0718-11f1-9c42-e21ad8f02b04', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'admin', 'admin@sprout.com', '$2y$10$IUhf4uuRlkTfH3aTGbnfE.f6oPzjwDoIunonW3zaqi3IqX3IGpucm', '753da22e-0716-11f1-9c42-e21ad8f02b04', 'Active', 1, NULL, '2026-02-20 10:58:59', NULL, NULL, '2026-02-11 10:46:53'),
(17, 'adc6e911-0cac-11f1-bbbb-14d424a2ecfa', '49c4c1c6-0718-11f1-9c42-e21ad8f02b04', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 'sample', 'sample@gmail.com', '$2y$10$LIy55hTbxpU/4xvEJvu0.OuMrIVzBVx4ueplFgJu4U.hdLDl5/.fq', '0cf0ee7b036fdda89039730a63117e63', 'Active', 1, NULL, NULL, NULL, NULL, '2026-02-18 09:31:58');

-- --------------------------------------------------------

--
-- Table structure for table `user_salary_details`
--

CREATE TABLE `user_salary_details` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `role_guid` char(36) NOT NULL,
  `organization_guid` char(36) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL DEFAULT 0.00,
  `allowances` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deductions` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(10,2) GENERATED ALWAYS AS (`basic_salary` + `allowances` - `deductions`) STORED,
  `payment_status` varchar(20) DEFAULT 'Unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_salary_details`
--

INSERT INTO `user_salary_details` (`id`, `user_guid`, `role_guid`, `organization_guid`, `basic_salary`, `allowances`, `deductions`, `payment_status`, `created_at`, `updated_at`) VALUES
(3, 'adc6e911-0cac-11f1-bbbb-14d424a2ecfa', '0cf0ee7b036fdda89039730a63117e63', '3d6dd9d1-9e9c-4d48-ab19-32c2bed9cfea', 15000.00, 200.00, 0.00, 'Unpaid', '2026-02-19 17:47:48', '2026-02-19 17:47:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance_guid` (`attendance_guid`),
  ADD UNIQUE KEY `unique_employee_date` (`organization_guid`,`employee_guid`,`attendance_date`),
  ADD KEY `fk_attendance_employee` (`employee_guid`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`budget_guid`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`client_guid`);

--
-- Indexes for table `followups`
--
ALTER TABLE `followups`
  ADD PRIMARY KEY (`followup_guid`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_guid` (`lead_guid`),
  ADD KEY `organization_guid` (`organization_guid`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `idx_client_name` (`client_name`),
  ADD KEY `idx_lead_guid` (`lead_guid`),
  ADD KEY `idx_lead_id` (`id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_guid` (`organization_guid`),
  ADD KEY `idx_company_name` (`company_name`),
  ADD KEY `idx_org_guid` (`organization_guid`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_guid`),
  ADD KEY `organization_guid` (`organization_guid`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_guid`),
  ADD KEY `organization_guid` (`organization_guid`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_guid`),
  ADD KEY `role_guid` (`role_guid`),
  ADD KEY `permission_guid` (`permission_guid`),
  ADD KEY `organization_guid` (`organization_guid`);

--
-- Indexes for table `salary_advance`
--
ALTER TABLE `salary_advance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `super_admin`
--
ALTER TABLE `super_admin`
  ADD PRIMARY KEY (`sa_id`),
  ADD UNIQUE KEY `super_admin_guid` (`super_admin_guid`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_guid` (`super_admin_guid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_guid` (`user_guid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `organization_guid` (`organization_guid`),
  ADD KEY `role_guid` (`role_guid`);

--
-- Indexes for table `user_salary_details`
--
ALTER TABLE `user_salary_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_salary_user` (`user_guid`),
  ADD KEY `fk_salary_role` (`role_guid`),
  ADD KEY `fk_salary_org` (`organization_guid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `salary_advance`
--
ALTER TABLE `salary_advance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `super_admin`
--
ALTER TABLE `super_admin`
  MODIFY `sa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `user_salary_details`
--
ALTER TABLE `user_salary_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
