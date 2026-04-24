CREATE TABLE `authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`photoUrl` text,
	`website` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`isbn` varchar(20),
	`coverImageUrl` text,
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2),
	`condition` enum('new','like_new','good','fair','poor') NOT NULL DEFAULT 'good',
	`category` varchar(100) NOT NULL,
	`language` varchar(50) DEFAULT 'English',
	`pageCount` int,
	`publishYear` int,
	`status` enum('available','sold','borrowed','unavailable') NOT NULL DEFAULT 'available',
	`listingType` enum('sell','lend','both') NOT NULL DEFAULT 'sell',
	`sellerId` int NOT NULL,
	`authorId` int,
	`authorName` varchar(255),
	`publisherId` int,
	`publisherName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `borrowings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int NOT NULL,
	`borrowDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp NOT NULL,
	`returnDate` timestamp,
	`status` enum('active','returned','overdue') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `borrowings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('borrowing_due','borrowing_overdue','order_update','system') NOT NULL DEFAULT 'system',
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`bookId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtPurchase` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentIntentId` varchar(255),
	`shippingAddress` text,
	`shippingCity` varchar(100),
	`shippingZip` varchar(20),
	`shippingCountry` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publishers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logoUrl` text,
	`website` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publishers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;