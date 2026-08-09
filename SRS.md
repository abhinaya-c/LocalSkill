
Tribhuvan University
Institute of Engineering
Pashchimanchal Campus
Pokhara, Nepal
Software Requirements Specification (SRS)
on
LOCAL SKILL MARKETPLACE PLATFORM
Prepared in accordance with IEEE Std 830-1998 and ISO/IEC/IEEE 29148:2018
Submitted By:
Abhinaya Chaurasiya (PAS080BEI005)
Pratik Pathak (PAS080BEI022)
Saugat Timilsina (PAS080BEI034)
Submitted To:
Department of Electronics and Computer Engineering
Pashchimanchal Campus
Pokhara, Nepal
June 2025

Table of Contents
1. Project Title3
2. Introduction3
2.1 Purpose3
2.2 Scope3
2.3 Intended Audience3
2.4 Definitions, Acronyms, and Abbreviations4
2.5 References4
2.6 Document Overview4
3. Overall Description4
3.1 Product Perspective4
3.2 Product Functions5
3.3 User Classes and Characteristics5
3.3.1 Customer5
3.3.2 Service Provider5
3.3.3 Administrator5
3.4 Constraints6
3.5 Assumptions6
3.6 Dependencies6
4. Requirements6
4.1 Functional Requirements6
4.1.1 Registration6
4.1.2 Authentication7
4.1.3 Profile Management7
4.1.4 Service Management7
4.1.5 Search and Filtering7
4.1.6 Location-Based Search8
4.1.7 Booking System8
4.1.8 Communication System8
4.1.9 Ratings and Reviews8
4.1.10 Recommendation Features9
4.1.11 Notifications9
4.1.12 Admin Features9
4.1.13 Security Features9
4.2 Non-Functional Requirements9
4.2.1 Performance Requirements9
4.2.2 Security Requirements10
4.2.3 Reliability Requirements10
4.2.4 Availability Requirements10
4.2.5 Scalability Requirements10
4.2.6 Usability Requirements10
4.2.7 Maintainability Requirements11
4.2.8 Compatibility Requirements11
4.2.9 Portability Requirements11
4.2.10 Accessibility Requirements11


1. Project Title
Official Project Title: Local Skill Marketplace Platform (LSMP)
A web-based application that connects customers with verified local skilled professionals (tutors, electricians, plumbers, photographers, designers, technicians) to enable service discovery, booking, communication, and trust-based reviews.
2. Introduction
2.1 Purpose
Purpose of the system:
Provide a centralized, trustworthy platform connecting customers with qualified local professionals.
Replace unreliable informal recommendations with verified profiles, transparent pricing, and genuine reviews.
Give skilled professionals an organized channel to advertise services and reach new clients.
Purpose of this SRS document:
Define the functional and non-functional requirements of the LSMP completely and unambiguously.
Serve as the agreement between the development team and stakeholders on what the system must do.
Act as the basis for system design, implementation, verification, and validation.
Conform to IEEE Std 830-1998 and ISO/IEC/IEEE 29148:2018.
2.2 Scope
What it does: a browser-based web application for discovering, booking, and reviewing local services on desktop and mobile.
Major features: registration and authentication, provider profile and listing management, keyword and location-based search with filters, booking and appointment management, real-time messaging, ratings and reviews, a recommendation engine, notifications, and an admin dashboard.
Goals: simplify discovery of reliable professionals, increase provider visibility and income, and build trust through verified credentials and transparent feedback.
Benefits: faster and safer access to services for customers, a wider client base for providers, and support for local employment and economic growth.
2.3 Intended Audience
Development Team: uses this document as the primary engineering reference.
Project Supervisor and Faculty: guide the project and assess conformance to requirements.
Evaluation Committee / External Examiners: review the document and product during formal assessment.
QA and Test Engineers: derive test cases and acceptance criteria from the requirements.
Future Developers / Maintainers: extend and maintain the system after release.
End Users (indirect): customers, providers, and administrators whose needs the requirements represent.
2.4 Definitions, Acronyms, and Abbreviations
Term
Meaning
SRS
Software Requirements Specification.
LSMP
Local Skill Marketplace Platform — the product specified here.
FR / NFR
Functional Requirement / Non-Functional Requirement.
API
Application Programming Interface.
JWT
JSON Web Token — signed token for stateless session management.
OAuth 2.0
Open authorization framework for third-party sign-in (e.g., Google).
REST
Representational State Transfer — architectural style for web APIs.
ORM
Object-Relational Mapping.
PWA
Progressive Web Application.
HTTPS / TLS
Encrypted protocols for secure network communication.
RBAC
Role-Based Access Control.
UI / UX
User Interface / User Experience.
Table 2.1: Definitions, Acronyms, and Abbreviations
2.5 References
IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.
ISO/IEC/IEEE 29148:2018, Requirements Engineering.
R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner’s Approach.
I. Sommerville, Software Engineering.
React.js, Node.js, Express.js, and PostgreSQL official documentation.
Firebase Authentication and Google Maps Platform documentation.
Git and GitHub documentation.
2.6 Document Overview
Section 3 (Overall Description): product perspective, product functions, user classes, constraints, assumptions, and dependencies.
Section 4 (Requirements): numbered functional requirements (4.1) and grouped, measurable non-functional requirements (4.2).
3. Overall Description
3.1 Product Perspective
The LSMP is a new, self-contained web application organized into four layers that interact with external services and three human actor classes (customers, providers, administrators).
Presentation Layer: React.js single-page / progressive web app rendered in the browser; the sole point of human interaction.
Application Layer: Node.js and Express.js services exposing REST and WebSocket endpoints; holds business logic for auth, search, booking, messaging, reviews, recommendations, and notifications.
Data Layer: PostgreSQL relational database for persistent data, with caching for sessions and object storage for uploaded files.
External Services: Firebase Authentication, Google Maps API, payment gateways, and SMS/e-mail notification gateways.
Customers and providers interact only through the presentation layer over secured HTTPS; administrators use a privileged admin interface to the same services.
3.2 Product Functions
User Registration: create customer or provider accounts with the required details and role selection.
Login and Authentication: authenticate users via credentials or Google OAuth and establish secure sessions.
Provider Profile Management: maintain professional profiles with skills, biography, portfolio, and verification documents.
Service Listing Management: create, edit, deactivate, or remove service listings with category, description, pricing, and availability.
Search and Filtering: search by keyword or category and refine results by price, rating, availability, and verification tier.
Location-Based Search: rank and map providers by proximity using the Google Maps API.
Booking and Appointment Management: request, accept, reschedule, or decline bookings and track their status to completion.
Messaging System: real-time chat between customers and providers with retained history.
Ratings and Reviews: submit and aggregate post-service ratings and reviews, with fake-review controls.
Recommendation Engine: suggest suitable providers from location, history, preferences, and ratings.
Notification System: alert users of bookings, messages, and reviews via in-app, e-mail, and SMS channels.
Admin Dashboard: manage users, verify providers, moderate content, resolve disputes, and monitor activity.
3.3 User Classes and Characteristics
3.3.1 Customer
Responsibilities: manage their account, search services, communicate needs, book and pay, and submit honest reviews.
Technical level: ordinary public with basic web/smartphone literacy; no specialized knowledge assumed.
Interactions: registration, search and discovery, profiles, messaging, booking and payment, and reviews.
3.3.2 Service Provider
Responsibilities: register, supply accurate profile and verification data, maintain listings and availability, respond to bookings and messages, deliver services, and mark them complete.
Technical level: basic to moderate digital literacy; management screens must stay simple.
Interactions: registration, profile and listing management, availability, booking handling, messaging, and earnings dashboard.
3.3.3 Administrator
Responsibilities: verify providers, moderate content, manage and suspend accounts, resolve disputes, and monitor platform health.
Access privileges: highest access level; privileged operations restricted via RBAC to authenticated admin accounts.
Interactions: operate solely through the admin dashboard in a supervisory capacity.
3.4 Constraints
Technical: React.js front end, Node.js/Express.js back end, PostgreSQL database, Firebase Authentication, Google Maps API, and Git/GitHub; delivered as a browser app over REST and WebSocket, requiring a modern browser and internet connection.
Security: all traffic over HTTPS/TLS; no plain-text credentials; Firebase Auth with signed JWTs; RBAC for privileged operations; safe handling of personal and payment data.
Resource: limited academic budget and timeline; reliance on open-source tools and free-tier services; small team and ordinary development hardware.
Regulatory: responsible, minimal data collection per accepted privacy principles; verification of recognized credentials where applicable; payments handled through compliant gateways rather than raw financial data.
3.5 Assumptions
All users have an internet-enabled device with a modern web browser.
Users and providers supply accurate information and genuine verification documents.
External services (Firebase, Google Maps, payment and notification gateways) remain available under their published interfaces.
Users grant required permissions such as location access where needed.
User and transaction volume stays within free-tier and development resource limits during the project.
3.6 Dependencies
Firebase Authentication: identity management and federated sign-in for registration, login, and sessions.
Google Maps API: geocoding, mapping, and proximity for location-based search.
PostgreSQL: persistent storage underpinning all data operations.
Node.js / Express.js and React.js: server runtime, web framework, and front-end library for all logic and UI.
Payment and Notification Gateways: external services for processing payments and delivering e-mail/SMS alerts.
Cloud, Storage, and Cache Services: hosting, object storage, and caching for deployment and performance.
Git and GitHub: version control and collaborative source management.
4. Requirements
Functional requirements (4.1) state the services the system shall provide; non-functional requirements (4.2) state its quality attributes. The verb “shall” denotes a mandatory requirement throughout.
4.1 Functional Requirements
Each requirement carries a unique FR-n identifier, grouped by capability area, in the “The system shall …” form.
4.1.1 Registration
ID
Requirement Description
FR-1
The system shall allow a new user to register an account by providing a valid name, e-mail address or phone number, and password.
FR-2
The system shall allow a user to select a role of either Customer or Service Provider at the time of registration.
FR-3
The system shall validate all registration inputs and reject the creation of an account when mandatory fields are missing or invalid, or when the e-mail address or phone number is already associated with an existing account.
4.1.2 Authentication
ID
Requirement Description
FR-4
The system shall authenticate a registered user upon submission of valid credentials and shall deny access when the credentials are invalid.
FR-5
The system shall support federated sign-in through Google OAuth 2.0 as an alternative to credential-based login.
FR-6
The system shall establish a secure, time-limited session represented by a signed token upon successful authentication, and shall allow the user to log out and thereby invalidate the active session.
FR-7
The system shall provide a password-recovery mechanism that allows a user to reset a forgotten password through a verified e-mail or phone-based process.
4.1.3 Profile Management
ID
Requirement Description
FR-8
The system shall allow a service provider to create and maintain a professional profile containing personal details, skill categories, a biography, contact information, and a portfolio of work samples.
FR-9
The system shall allow a service provider to upload verification documents and shall display the provider’s attained verification tier on the public profile.
FR-10
The system shall allow every registered user to view and update their own account information and to deactivate or delete their account.
4.1.4 Service Management
ID
Requirement Description
FR-11
The system shall allow a service provider to create a service listing specifying the service category, description, pricing model, and availability.
FR-12
The system shall allow a service provider to edit, deactivate, or remove any of their existing service listings.
FR-13
The system shall allow a service provider to configure available appointment slots together with the applicable hourly or fixed-rate pricing for each service.
4.1.5 Search and Filtering
ID
Requirement Description
FR-14
The system shall allow a customer to search for services using free-text keywords and by selecting predefined service categories.
FR-15
The system shall allow a customer to refine search results using filters including price range, minimum rating, availability, and verification tier.
FR-16
The system shall present search results in a structured, sortable list that displays each provider’s key attributes such as name, rating, price, and distance.
4.1.6 Location-Based Search
ID
Requirement Description
FR-17
The system shall determine the customer’s location, with the customer’s consent, and rank matching service providers by geographic proximity using the Google Maps API.
FR-18
The system shall display matching service providers on an interactive map and allow the customer to view provider locations relative to their own.
4.1.7 Booking System
ID
Requirement Description
FR-19
The system shall allow a customer to request a booking against an available time slot published by a service provider.
FR-20
The system shall allow a service provider to accept, reschedule, or decline a received booking request and shall notify the customer of the outcome.
FR-21
The system shall track and display the status of each booking throughout its lifecycle, including the requested, confirmed, in-progress, completed, and cancelled states.
FR-22
The system shall allow a service provider to mark a confirmed service as complete, thereby enabling the associated payment-release and review workflows.
4.1.8 Communication System
ID
Requirement Description
FR-23
The system shall provide a real-time messaging facility that allows a customer and a service provider to exchange text messages in connection with a service or booking.
FR-24
The system shall retain the message history of each conversation and make it available to the participating parties for later review.
4.1.9 Ratings and Reviews
ID
Requirement Description
FR-25
The system shall allow a customer to submit a numeric rating and a written review for a service provider only after the associated service has been marked complete.
FR-26
The system shall aggregate the ratings received by each provider into a representative average score and display it on the provider’s profile.
FR-27
The system shall incorporate measures to detect and restrict fraudulent or duplicate reviews in order to preserve the integrity of the feedback mechanism.
4.1.10 Recommendation Features
ID
Requirement Description
FR-28
The system shall recommend relevant service providers to a customer based on factors including the customer’s location, search history, stated preferences, and provider ratings.
FR-29
The system shall update and refine the recommendations presented to a customer as additional interaction data becomes available.
4.1.11 Notifications
ID
Requirement Description
FR-30
The system shall generate notifications to inform users of relevant events, including new booking requests, booking confirmations or cancellations, new messages, and submitted reviews.
FR-31
The system shall deliver notifications through in-application alerts and, where appropriate, through external e-mail or SMS channels.
4.1.12 Admin Features
ID
Requirement Description
FR-32
The system shall provide an administrative dashboard through which an administrator can view, manage, and suspend customer and service-provider accounts.
FR-33
The system shall allow an administrator to review and approve or reject service-provider verification requests and to moderate listings and reviews.
FR-34
The system shall allow an administrator to view platform activity and usage statistics for monitoring and oversight purposes.
4.1.13 Security Features
ID
Requirement Description
FR-35
The system shall enforce role-based access control so that each user can perform only the operations authorised for their assigned role.
FR-36
The system shall transmit all data between client and server over encrypted HTTPS/TLS connections.
FR-37
The system shall store user credentials in a securely hashed form and shall never retain or display passwords in plain text.
4.2 Non-Functional Requirements
Each requirement carries a unique NFR-n identifier, grouped by quality attribute, with measurable criteria where practical.
4.2.1 Performance Requirements
ID
Requirement Description
NFR-1
The system shall return the results of a typical search query within 3 seconds under normal operating load.
NFR-2
The system shall load and render any standard page within 4 seconds over a broadband connection.
NFR-3
The system shall support at least 200 concurrent active users during the academic deployment without perceptible degradation of responsiveness.
4.2.2 Security Requirements
ID
Requirement Description
NFR-4
The system shall encrypt all data in transit using TLS 1.2 or a later version.
NFR-5
The system shall hash and salt all stored passwords using an industry-accepted algorithm and shall never store them in reversible form.
NFR-6
The system shall enforce authentication and role-based authorisation on every protected endpoint, rejecting any unauthorised request.
NFR-7
The system shall automatically expire an inactive user session after a defined period not exceeding 30 minutes.
4.2.3 Reliability Requirements
ID
Requirement Description
NFR-8
The system shall correctly process valid transactions and shall handle invalid inputs gracefully, returning informative error messages rather than failing unexpectedly.
NFR-9
The system shall ensure that no committed booking, payment, or review record is lost in the event of a recoverable failure, maintaining data consistency through transactional integrity.
4.2.4 Availability Requirements
ID
Requirement Description
NFR-10
The system shall be available for use at least 99% of the time, measured on a monthly basis, excluding scheduled maintenance windows.
NFR-11
The system shall perform regular automated backups of the primary database at least once every 24 hours and shall be capable of restoring service from the most recent backup.
4.2.5 Scalability Requirements
ID
Requirement Description
NFR-12
The system shall be designed so that additional application-server capacity can be added horizontally to accommodate growth in the number of users and requests.
NFR-13
The system shall maintain acceptable response times as the stored data volume grows, through appropriate indexing and caching of frequently accessed data.
4.2.6 Usability Requirements
ID
Requirement Description
NFR-14
The system shall provide an intuitive user interface that enables a first-time user to complete core tasks, such as searching for and booking a service, without external assistance.
NFR-15
The system shall present clear, consistent navigation and informative feedback messages for user actions, errors, and confirmations throughout the application.
4.2.7 Maintainability Requirements
ID
Requirement Description
NFR-16
The system shall be developed using a modular architecture with clear separation between the presentation, application, and data layers to facilitate maintenance and enhancement.
NFR-17
The system’s source code shall be managed under version control and shall follow consistent coding conventions and documentation to support future modification.
4.2.8 Compatibility Requirements
ID
Requirement Description
NFR-18
The system shall operate correctly on the current and immediately preceding major versions of the leading web browsers, including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.
NFR-19
The system shall render and function correctly across desktop, tablet, and mobile screen sizes through a responsive design.
4.2.9 Portability Requirements
ID
Requirement Description
NFR-20
The system, being a browser-based web application, shall be accessible from any device with a compatible web browser regardless of the underlying operating system.
NFR-21
The system shall be deployable to standard cloud or container-based hosting environments without modification to its application logic.
4.2.10 Accessibility Requirements
ID
Requirement Description
NFR-22
The system shall follow recognised web accessibility guidelines, including the use of adequate colour contrast, descriptive labels, and keyboard navigability, to remain usable by people with a range of abilities.
NFR-23
The system shall present all interface text in clear, simple language and shall provide text alternatives for non-textual content such as icons and images.