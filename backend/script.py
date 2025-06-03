from flask import Flask, request, jsonify,send_from_directory,Response
import mysql.connector as conn
from flask_cors import CORS
import base64

import os
import bcrypt




app = Flask(__name__, static_folder="../shopping-app/build", static_url_path="/")
CORS(app)
@app.route('/github-auth')
def github_auth():
    res = requests.get("https://global.rel.tunnels.api.visualstudio.com/auth/github?...")  # External request
    return jsonify(res.json())
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
# User registration
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or request.form
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'All fields are required'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 409

        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (username, email, hashed_password))
        con.commit()
        cursor.close()
        con.close()

        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or request.form
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Email and password required'}), 400

    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'message': 'Login successful', 'user': {'id': user['id'], 'username': user['username'], 'email': user['email']}}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/add-product', methods=['POST'])
def add_product():
    try:
        name = request.form['name']
        price = request.form['price']
        color = request.form['color']
        gender = request.form['gender']
        type_ = request.form['type']
        description = request.form.get('description', '')  # get safely
        sizes = request.form.getlist('sizes')
        image = request.files['image'].read()

        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        # Insert into products (include description)
        cursor.execute("""
            INSERT INTO products (name, price, color, gender, type, image, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, price, color, gender, type_, image, description))

        product_id = cursor.lastrowid

        for size in sizes:
            cursor.execute("INSERT INTO product_sizes (product_id, size) VALUES (%s, %s)", (product_id, size))

        con.commit()
        cursor.close()
        con.close()
        return jsonify({'message': 'Product added successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Get all products
@app.route('/all-products', methods=['GET'])
def all_products():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        cursor.execute("SELECT id, name, price, color, gender,description, type, image FROM products")
        products = cursor.fetchall()

        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        for product in products:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/product/<int:id>')

def get_product(id):
    con = conn.connect(
        host='localhost',
        user='root',
        password='Simba@123',
        database='shopping',
        charset='utf8',
        port=3306
    )
    cursor = con.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products WHERE id = %s", (id,))
    product = cursor.fetchone()
    con.close()

    if product and isinstance(product.get('image'), bytes):
        # Encode the image to base64 string
        product['image'] = base64.b64encode(product['image']).decode('utf-8')

    return product
# Add item to cart
@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        print("Received data:", data)

        user_id = data.get('user_id')
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        size = data.get('size')

        if not user_id or not product_id:
            return jsonify({'error': 'Missing user_id or product_id'}), 400

        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({'error': 'Quantity must be a positive integer'}), 400

        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        cursor.execute("""
            INSERT INTO cart_items (user_id, product_id, quantity, size)
            VALUES (%s, %s, %s, %s)
        """, (user_id, product_id, quantity, size))

        con.commit()
        cursor.close()
        con.close()

        return jsonify({'message': 'Item added to cart'}), 200

    except Exception as e:
        print("Error adding to cart:", e)
        return jsonify({'error': str(e)}), 500

# Get all cart items for a user
@app.route('/get-cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Join cart_items with products to get product details
        query = """
            SELECT 
                ci.id, ci.product_id, ci.size, ci.quantity, ci.added_at,
                p.name AS product_name, p.price AS product_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = %s
        """
        cursor.execute(query, (user_id,))
        items = cursor.fetchall()

        # Transform the result to nest product info inside each cart item
        cart = []
        for item in items:
            cart.append({
                'id': item['id'],
                'size': item['size'],
                'quantity': item['quantity'],
                'added_at': item['added_at'],
                'product': {
                    'id': item['product_id'],
                    'name': item['product_name'],
                    'price': item['product_price'],
                }
            })

        cursor.close()
        con.close()

        return jsonify({'cart': cart}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Get image of cart item
@app.route('/get-cart-image/<int:item_id>', methods=['GET'])
def get_cart_image(item_id):
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        cursor.execute("""
            SELECT p.image
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.id = %s
        """, (item_id,))
        result = cursor.fetchone()
        cursor.close()
        con.close()

        if result and result[0]:
            return Response(result[0], mimetype='image/jpeg')
        else:
            return jsonify({'error': 'Image not found'}), 404

    except Exception as e:
        print("Exception occurred:", e)  # 👈 Add this
        return jsonify({'error': str(e)}), 500

# Update cart item
@app.route('/update-cart/<int:item_id>', methods=['POST'])
def update_cart(item_id):
    try:
        size = request.form.get('size')
        quantity = request.form.get('quantity')
        image_file = request.files.get('image')

        update_fields = []
        values = []

        if size:
            update_fields.append("size=%s")
            values.append(size)
        if quantity:
            update_fields.append("quantity=%s")
            values.append(quantity)
        if image_file:
            update_fields.append("image=%s")
            values.append(image_file.read())

        if not update_fields:
            return jsonify({'error': 'No data to update'}), 400

        values.append(item_id)

        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        sql = f"UPDATE cart_items SET {', '.join(update_fields)} WHERE id=%s"
        cursor.execute(sql, tuple(values))

        con.commit()
        cursor.close()
        con.close()

        return jsonify({'message': 'Cart item updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete cart item
@app.route('/delete-cart/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor()

        cursor.execute("DELETE FROM cart_items WHERE id=%s", (item_id,))
        con.commit()

        cursor.close()
        con.close()

        return jsonify({'message': 'Cart item deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/search-products', methods=['GET'])
def search_products():
    try:
        # Get query param `q` (e.g., /search-products?q=shirt)
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Search in name, color, gender, and type using LIKE
        sql = """
            SELECT id, name, price, color, gender, type, image
            FROM products
            WHERE name LIKE %s OR color LIKE %s OR gender LIKE %s OR type LIKE %s
        """
        like_query = f"%{query}%"
        cursor.execute(sql, (like_query, like_query, like_query, like_query))
        results = cursor.fetchall()

        # Attach sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        size_data = cursor.fetchall()
        size_map = {}
        for s in size_data:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        for product in results:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/product_sizes/<int:product_id>', methods=['GET'])
def get_product_sizes(product_id):
    con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
    cursor = con.cursor(dictionary=True)
    cursor.execute("SELECT size FROM product_sizes WHERE product_id = %s", (product_id,))
    sizes = [row['size'] for row in cursor.fetchall()]
    cursor.close()
    con.close()
    return jsonify(sizes)


@app.route("/update-product/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    con = conn.connect(
        host='localhost',
        user='root',
        password='Simba@123',
        database='shopping',
        charset='utf8',
        port=3306
    )
    cursor = con.cursor(dictionary=True)

    name = request.form.get("name")
    price = request.form.get("price")
    color = request.form.get("color")
    gender = request.form.get("gender")
    type_ = request.form.get("type")
    description = request.form.get("description")
    sizes = request.form.getlist("sizes")

    image = request.files.get("image")
    if image:
        image_data = image.read()
        cursor.execute(
            """
            UPDATE products SET name=%s, price=%s, color=%s,
            gender=%s, type=%s, description=%s, image=%s WHERE id=%s
            """,
            (name, price, color, gender, type_, description, image_data, product_id)
        )
    else:
        cursor.execute(
            """
            UPDATE products SET name=%s, price=%s, color=%s,
            gender=%s, type=%s, description=%s WHERE id=%s
            """,
            (name, price, color, gender, type_, description, product_id)
        )

    # Update sizes
    cursor.execute("DELETE FROM product_sizes WHERE product_id = %s", (product_id,))
    for size in sizes:
        cursor.execute(
            "INSERT INTO product_sizes (product_id, size) VALUES (%s, %s)",
            (product_id, size.strip())
        )

    con.commit()
    cursor.close()
    con.close()

    return jsonify({"message": "Product updated successfully"}), 200
@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
    
    cursor = con.cursor( dictionary=True)
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    con.commit()
    return jsonify({"message": "Deleted"}), 200


@app.route("/MEN", methods=['GET'])
def get_products_by_category():
    try: 
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
            SELECT id, name, price, color, gender, description, type, image 
            FROM products 
            WHERE LOWER(gender) IN (%s, %s)
        """, ('male', 'men'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route("/MEN-TSHIRT", methods=['GET'])
def get_products_by_categoryT():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s, %s)
""", ('male', 'men', 'tshirt',  't-shirt'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route("/MEN-SHIRT", methods=['GET'])
def get_products_by_categoryS():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s, %s)
""", ('male', 'men', 'shirts',  'shirt'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route("/MEN-JACKETS", methods=['GET'])
def get_products_by_categoryJ():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s,%s)
""", ('male', 'men', 'jackets','jacket'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route("/MEN-PANTS", methods=['GET'])
def get_products_by_categoryP():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s,%s,%s,%s)
""", ('male', 'men', 'pant', 'cargo','pants','cargos'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route("/WOMEN", methods=['GET'])
def get_products_by_categoryW():
    try: 
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
            SELECT id, name, price, color, gender, description, type, image 
            FROM products 
            WHERE LOWER(gender) IN (%s, %s)
        """, ('female', 'women'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route("/WOMEN-HODIE", methods=['GET'])
def get_products_by_categoryWH():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s,%s,%s,%s)
""", ('female', 'women', 'hoddies','hoddie','hoodies','hoodie'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route("/WOMEN-1PIECE", methods=['GET'])

def get_products_by_categoryW1():
    try:
        con = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = con.cursor(dictionary=True)

        # Fetch products where gender is 'male' or 'men'
        cursor.execute("""
           SELECT id, name, price, color, gender, description, type, image 
    FROM products 
    WHERE LOWER(gender) IN (%s, %s)
    AND LOWER(type) IN (%s,%s,%s,%s)
""", ('female', 'women', '1-piece','1-pieces','1 piece','1 pieces'))
        products1 = cursor.fetchall()

        # Fetch product sizes
        cursor.execute("SELECT product_id, size FROM product_sizes")
        sizes = cursor.fetchall()

        # Map sizes to corresponding products
        size_map = {}
        for s in sizes:
            size_map.setdefault(s['product_id'], []).append(s['size'])

        # Attach sizes and encode image
        for product in products1:
            product['sizes'] = size_map.get(product['id'], [])
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')
            else:
                product['image'] = None

        cursor.close()
        con.close()
        return jsonify(products1)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/WOMEN-SKIRTS')
def get_women_skirts():
    try:
        db = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = db.cursor(dictionary=True)

        query = """
        SELECT id, name, price, color, gender, description, type, image
        FROM products
        WHERE LOWER(gender) IN (%s, %s)
        AND LOWER(type) IN (%s, %s, %s)
        """
        values = ('female', 'women', 'skirt', 'skirts', 'skrt')

        cursor.execute(query, values)
        products = cursor.fetchall()

        for product in products:
            if product['image']:
                product['image'] = base64.b64encode(product['image']).decode('utf-8')

        return jsonify(products)
    except Exception as e:
        print("Error in /WOMEN-SKIRTS:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/WOMEN-SHIRTS')
def get_women_tshirts():
    try:
        db = conn.connect(
            host='localhost',
            user='root',
            password='Simba@123',
            database='shopping',
            charset='utf8',
            port=3306
        )
        cursor = db.cursor(dictionary=True)

        query = """
        SELECT id, name, price, color, gender, description, type, image
        FROM products
        WHERE LOWER(gender) IN (%s, %s)
        AND LOWER(type) IN (%s, %s, %s, %s)
        """

        values = ('female', 'women', 't-shirt', 't-shirts', 'tshirts', 'tshirt')
        cursor.execute(query, values)

        data = cursor.fetchall()

        # Convert BLOB image to base64 string
        for item in data:
            if item['image']:
                item['image'] = base64.b64encode(item['image']).decode('utf-8')

        return jsonify(data)
    except Exception as e:
        print("Error in /WOMEN-SHIRTS:", e)
        return jsonify({'error': str(e)}), 500
    

if __name__ == "__main__":
       app.run(host="0.0.0.0", port=5000, debug=True)
