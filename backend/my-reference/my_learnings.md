Whenever you read a state variable, a prop, or any value derived from them inside a useEffect hook, you must include it in the dependency array.


# 📌 Cheat Sheet: Focus vs. Hover

### 1. The Core Difference
* **Focus (`onFocus`)**: Runs when element is **active** (clicked, keyboard tabbed, or via code).
* **Hover (`onMouseEnter`)**: Runs when mouse pointer **moves over** the element.

### 2. Focusable Elements
* **Default**: `<input>`, `<textarea>`, `<button>`, `<select>`, `<a href="...">`.
* **Non-focusable**: `<div>`, `<span>`, `<p>`, `<h1>`.
* **The Override**: Add `tabIndex={0}` to make any element focusable.

### 3. React vs. Raw HTML

| Feature | React | Raw HTML / JS |
| :--- | :--- | :--- |
| **Event** | `onFocus` / `onBlur` | `onfocus` / `onblur` |
| **Attribute** | `tabIndex` | `tabindex` |
| **Bubbling** | Yes | No (use `focusin`) |



# the areas where we can render or write the jsx
### 1. inside the return ()
### 2.inside the call backs of built in functions like arrray functions,object functions which will return the value
### 3.we can store the jsx in the js objects and render by accessing the object
