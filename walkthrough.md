# Walkthrough - MomsAffection Project Completed

The MomsAffection web application has been successfully restructured, developed, and compiled. We have created a decoupled architecture with a stateless PHP backend API and a modern React + Vite frontend client.

---

## 1. Directory Structure Created

The following layout is available in the workspace:

```text
momsaffection/
├── backend/                  # PHP REST APIs
│   ├── config/
│   │   ├── db.php            # Database connections and CORS
│   │   └── auth_helper.php   # JWT Stateless auth handlers
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.php     # Unified Customer/Admin login
│   │   │   ├── register.php  # Customer register validation
│   │   │   └── logout.php    # Clean signoff
│   │   ├── customer/
│   │   │   ├── profile.php   # Profile updates and Account deletion
│   │   │   └── address.php   # Delivery directories manager
│   │   ├── products/
│   │   │   ├── list.php      # Products list with search and filter
│   │   │   └── detail.php    # Single product specs and reviews list
│   │   ├── cart/
│   │   │   └── manage.php    # Syncs cart with DB
│   │   ├── orders/
│   │   │   ├── place.php     # Order placement logic
│   │   │   ├── list.php      # Customer purchase logs
│   │   │   └── status.php    # Shipment tracking updates
│   │   ├── admin/
│   │   │   ├── products.php  # Inventory CRUD and image uploads
│   │   │   ├── orders.php    # Orders management and status updates
│   │   │   └── customers.php # Client directories management
│   │   ├── payment/
│   │   │   └── razorpay.php  # Razorpay Order creation & validation
│   │   └── contact.php       # Contact form submissions
│   ├── uploads/              # Uploaded images directory
│   ├── .env                  # Configuration variables
│   └── seed.sql              # Database seed script
│
└── frontend/                 # React UI (Vite-based application)
    ├── src/
    │   ├── components/       # Reusable layout fragments (Navbar, Footer)
    │   ├── context/          # State providers (AuthContext, CartContext)
    │   ├── pages/            # View pages (Home, Shop, Product, Cart, etc.)
    │   ├── App.css           # Blank style variables
    │   ├── App.jsx           # Routing mapping
    │   ├── index.css         # Theme typography and animations
    │   └── main.jsx          # Entry point
    └── package.json          # Node modules declarations
```

---

## 2. Database Initialization and Seeding

We created a seed SQL script [seed.sql](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/backend/seed.sql) to set up tables and default items.

### Default Admin Account
- **Username / Email:** `admin@momsaffection.com`
- **Password:** `adminpassword`
- **Mobile:** `1234567890`

### Seeding Command
You can run this query directly on your database manager (XAMPP phpMyAdmin or command-line MySQL client):
```bash
mysql -u root -p < backend/seed.sql
```

---

## 3. Backend REST APIs (PHP)

All endpoints in `backend/api/` return JSON and feature automatic CORS headers so they communicate cleanly with Vite's client port.

- **CORS Handling:** Checked inside [db.php](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/backend/config/db.php). Supports Preflight OPTIONS requests.
- **JWT Authorization:** Handled statelessly inside [auth_helper.php](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/backend/config/auth_helper.php). Reads bearer tokens in requests header to validate.
- **Image Upload:** Enabled inside [admin/products.php](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/backend/api/admin/products.php). Moves uploaded images to `backend/uploads/` safely.

---

## 4. Frontend UI Pages (React)

boilerplate layouts were successfully migrated from static HTML to React JSX pages with advanced CSS elements, transitions, and icons.

- **Global Navigation & Layout:** Managed inside [Navbar.jsx](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/frontend/src/components/Navbar.jsx) and [Footer.jsx](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/frontend/src/components/Footer.jsx).
- **Core State Providers:**
  - [AuthContext.jsx](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/frontend/src/context/AuthContext.jsx) manages login/registration requests, session tokens, and global toast alerts.
  - [CartContext.jsx](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/frontend/src/context/CartContext.jsx) coordinates item additions, quantity updates, and syncing guest storage with database tables.
- **Razorpay Checkout:** Integrated inside [Checkout.jsx](file:///c:/Users/MOUTRISHA/Downloads/momsaffection/frontend/src/pages/Checkout.jsx). Automatically detects if Razorpay keys are configured in `backend/.env`. If keys are absent, it operates in **Sandbox Simulation Mode**, allowing orders to proceed without failure.

---

## 5. Local Running Instructions

Follow these steps to run the application locally:

### Step 1: Start Database & PHP Server
Ensure MySQL is running (e.g., via XAMPP). Then, start the PHP server on port `8000`:
```bash
cd backend
php -S localhost:8000
```

### Step 2: Start React Vite Client
Start the local Vite server:
```bash
cd frontend
npm run dev
```
Open the provided URL in your browser (typically `http://localhost:5173`).

---

## 6. Verification Results

We verified that the React project compiles and builds successfully for production without errors:
- Built in 2.96s.
- 0 vulnerabilities.
- Transformed 1793 modules.

---

## 7. Admin Category Management Section

We have implemented a brand new **Category Management** section in the Admin Console. Admins can now manage product categories directly from the dashboard.

### Core Features Added
1. **Stateless Category REST Endpoints**: Created [categories.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/admin/categories.php) to process list (`GET`), create/update (`POST`), and delete (`DELETE`) requests securely for admins.
2. **Interactive UI Management**: Added a dedicated **Categories** tab in the sidebar of [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx).
3. **Modal Dialog Editors**: Built intuitive forms for registering and editing category names, descriptions, and statuses (Active/Inactive).
4. **Referential Integrity Protection**: Built validation check to prevent deleting categories that have active products assigned, suggesting admins deactivate them instead.
5. **Kitchen Inventory Syncing**: Seamlessly integrated the dynamic categories list into the **Add/Edit Product** modal category selection dropdown.

### Verification Screen Recordings
We have validated all category management steps:
- Opening the categories list tab showing Dry Foods and Snacks.
- Adding a new category "Beverages".
- Confirming "Beverages" automatically lists in the products add/edit dropdown.
- Successfully creating a product assigned to the new "Beverages" category.

The verified browser session recording is available at:
![Category Management Validation](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/admin_category_management_check_1783448265573.webp)

---

## 8. Admin and User Password Modification

We have added support for administrators to change their own password as well as any other client user's password directly from the Admin Console.

### Core Features Added
1. **Stateless Password REST Endpoint**: Created [change_password.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/admin/change_password.php) to process password changes securely. It hashes password using standard BCrypt (`cost => 12`) and supports changing own password (if no `user_id` is supplied) or a specific user's password.
2. **Admin Own Password Modification**: Added a "Change Password" button in the Admin Console header.
3. **Client Password Modification**: Added a "Password" button for each user row in the **Client Directory** table.
4. **Change Password Modal**: Built a shared Modal component inside [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx) with validation (e.g. minimum 6 characters).

### Verification
- We verified that the Administrator can open the password modal, change their own password, log out, log back in using the updated password, and successfully revert it back.
- Compilation and build completed successfully.

The verified browser session recording is available at:
![Password Management Validation](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/admin_change_passwords_check_1783448773316.webp)

---

## 9. Customer Forgot Password System

We have implemented a secure **Forgot Password** password reset option specifically for customers in the login interface.

### Core Features Added
1. **Verification Endpoint**: Created a public REST API [forgot_password.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/auth/forgot_password.php). It verifies that:
   - The user has the `CUSTOMER` role (meaning it refuses to change administrator passwords via this public endpoint).
   - The user's registered Email and Mobile number match exactly.
2. **"Forgot Password?" Link**: Placed a clickable link in the login form of [Login.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/Login.jsx).
3. **Reset Password Dialog**: Built a secure Modal in the login view prompting the user for verification details (email, mobile) and the new password.

### Verification
- We verified the entire flow by resetting a test customer's password via the login modal using their registered email and mobile, then successfully logging into their customer dashboard `/dashboard` using the newly defined password.

The verified browser session recording is available at:
![Forgot Password Validation](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/forgot_password_old_pass_check_1783450617135.webp)

---

## 10. Product Mini Thumbnails in Admin Dashboard

We have added product image thumbnails in the Kitchen Products table within the Admin Console.

### Core Features Added
1. **Dynamic Image Column**: Added a new **Image** column to the products table inside [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx).
2. **Mini Icon & Fallback Rendering**:
   - If a product has an uploaded image (stored in `PRODUCT_IMAGE`), the column displays a mini thumbnail rendering from `http://localhost:8000/{PRODUCT_IMAGE}`.
   - If no image is uploaded, it displays a beautiful placeholder container utilizing Lucide's `Image` icon.

### Verification
- We verified the rendering of both uploaded image thumbnails and fallback dashed placeholder icons inside the Kitchen Products table.

The verified browser screenshot is available at:
![Product Table Image Column Screenshot](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/admin_products_thumbnails_1783451629188.png)

---

## 11. Product Discounts & Sell Price System

We have added support for defining product discounts and selling prices in both the admin management console and client-facing interfaces.

### Core Features Added
1. **Database Schema Update**: Run migration queries to add `PRODUCT_DISCOUNT` and `PRODUCT_SELL_PRICE` decimal columns to the `MM_PRODUCT` table.
2. **Accept discount/sell price in backend API**: Updated [products.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/admin/products.php) to insert and update discount and sell price values.
3. **Price Sorting & Cart Calculations**: Updated product listings [list.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/products/list.php) to sort by selling price and modified [manage.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/cart/manage.php) to compute totals using the active discounted selling price.
4. **Interactive Auto-Calculations in UI**:
   - In [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx), updating the Original Price or Discount Amount automatically updates the Sell Price. Conversely, setting the Sell Price manually computes the correct Discount Amount.
   - Displayed crossed-out Original Price (MRP) and highlighted Selling Price inside the admin inventory list.
5. **Customer storefront updates**:
   - Updated the product cards in [Shop.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/Shop.jsx) and the details page in [Product.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/Product.jsx) to clearly call out customer savings ("Save ₹25!") and show the active discounted price.
   - Integrated the discounted price into the shopping cart (`CartContext.jsx`) for correct subtotal/checkout computations.

### Verification
- We verified the entire E2E flow: creating a product with pricing discounts, automatic sell price calculation, verifying storefront crossed-out rendering, checking detail page tags, and verifying cart subtotal calculation matches the discounted price.

The verified browser session recording is available at:
![Product Discounting & Checkout Verification](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/discount_pricing_e2e_check_1783452126632.png)

---

## 12. Responsive UI for Desktop & Mobile Phones

We have upgraded the layouts across the platform to adapt seamlessly to any desktop and mobile phone screen.

### Core Features Upgraded
1. **Header Navigation Drawer**:
   - Added a responsive Hamburger menu toggle (`Menu` and `X` icons) in [Navbar.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/components/Navbar.jsx) using React state.
   - Refactored the header layout CSS in [index.css](file:///c:/xampp/htdocs/momsaffection/frontend/src/index.css) to hide the navigation links and desktop profile links (`desktop-nav-profile`) on mobile widths (under `768px`).
   - Integrated the user's dashboard console links and logout buttons directly into the vertical mobile drawer (`mobile-only-link`), avoiding any header layout crowding.
2. **Dashboard sidebar menu**:
   - Converted the vertical tab list on both the Admin Console ([AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx)) and Customer Dashboard ([CustomerDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/CustomerDashboard.jsx)) into a class (`dashboard-sidebar`).
   - In [index.css](file:///c:/xampp/htdocs/momsaffection/frontend/src/index.css), added style overrides under `900px` screen widths to display these buttons in a single horizontally scrollable row of chips with `-webkit-overflow-scrolling: touch` touch scrolling.
3. **Featured Hero & Grid elements**:
   - Converted hardcoded circle sizes (`380px` width) in the hero section of [Home.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/Home.jsx) to relative percentage boundaries (`width: '100%', maxWidth: '380px', aspectRatio: '1/1'`) to prevent overflow.
   - Replaced inline grid styles on the shop layout grid in [Shop.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/Shop.jsx) with a class name (`shop-grid`) that collapses to `1fr` on screens under `768px`.

### Verification
- We verified the mobile layout scaling at `390px` width.
- Checked the responsive hamburger toggle, menu dropdown links, mobile profile drawers, and horizontally scrollable admin navigation chips.

The verified screenshots are available at:
- **Mobile Homepage Hamburger Menu Open**:
  ![Mobile Homepage Menu Open](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/mobile_homepage_drawer_1783453694505.png)
- **Mobile Admin Dashboard Horizontal Scroll Menu**:
  ![Mobile Admin Dashboard Navigation Tabs](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/mobile_admin_dashboard_1783453651166.png)

---

## 13. Kitchen Inventory Product Pagination

We have integrated table list pagination into the Admin Dashboard's Kitchen Products Inventory panel to ensure clean and manageable loading of large catalogs.

### Core Features Added
1. **Client-Side Pagination Slicing**:
   - Declared page index controls (`currentPage` and `productsPerPage = 20`) in [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx).
   - Sliced the master products state to select only the items assigned to the current active viewport window (`currentProducts`).
   - Automatically synchronizes page range parameters to prevent index errors if database items are cleared or modified.
2. **Navigation Buttons & Indicators**:
   - Rendered **Previous** and **Next** button controls below the Kitchen Products Table.
   - Disabled "Previous" on the first page and "Next" on the last page.
   - Displayed active page progress metadata (e.g., "Page 1 of 6").

### Verification
- Temporarily configured page limits to 3 items and verified the full pagination transition E2E (previous/next button disabling states, list updates, page indicators). Reverted back to the required limit of 20 products per page.

The verified browser screenshot is available at:
![Kitchen Inventory Product Pagination](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/81562b01-44e4-44ef-a5b3-5202fa8d0e03/inventory_pagination_1783454079439.png)

---

## 14. Updated Database Schema Backup

We have integrated all updates to the database structure into the master SQL backup file.

### Core Features Added
1. **Schema Standardization**:
   - Modified [moms_db.sql](file:///c:/xampp/htdocs/momsaffection/moms_db.sql) to add the `PRODUCT_DISCOUNT` and `PRODUCT_SELL_PRICE` decimal columns.
   - Ensures any clean installs of the schema match the active production instance.

---

## 15. Admin Console Reviews Integration

We have integrated a full review management console for the Administrator to browse, review, and delete customer feedback on any product.

### Core Features Added
1. **Admin Reviews API**:
   - Created [reviews.php](file:///c:/xampp/htdocs/momsaffection/backend_api/api/admin/reviews.php) to support listing all customer reviews with product and customer details.
   - Added a `DELETE` request handler to allow administrators to remove inappropriate feedback from the database.
2. **Dashboard Review Pane**:
   - Integrated the "Customer Reviews" sidebar tab option in [AdminDashboard.jsx](file:///c:/xampp/htdocs/momsaffection/frontend/src/pages/AdminDashboard.jsx).
   - Renders a clean grid layout presenting the product image, name, customer, rating (as star icons), review comment, and a delete action button.



