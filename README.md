# **CSS Organizer**

**CSS Organizer** is a Visual Studio Code extension that streamlines and optimizes the management of CSS files by automatically reorganizing CSS properties into a logical and consistent order upon saving.

---

## **Key Features**

### 1. Automatic CSS Property Sorting

- Automatically reorganizes CSS properties into a predefined, logical order every time you save a file.

### 2. Logical CSS Property Order

- Properties are grouped and sorted based on functionality, such as:
  - **Fonts**: `font-family`, `font-size`
  - **Positioning**: `position`, `top`, `left`, etc.
  - **Sizing**: `width`, `height`, `margin`, `padding`
  - **Visual styles**: `background-color`, `border`, `box-shadow`

Example of the sorting order:

```css
.my-class {
    font-family;
    cursor;
    user-select;
    overflow;
    position;
    top;
    left;
    bottom;
    right;
    margin: auto; /* Special handling for "auto" values */
    display;
    flex;
    align-items;
    justify-content;
    width;
    height;
    color;
    background-color;
    border;
    border-radius;
    box-shadow;
    transform;
    transition;
    z-index;
}
```

### 3. Consistent CSS Formatting

    •	Ensures that your CSS files follow a uniform style, improving readability and maintainability.

### 4. SCSS and LESS Support (Optional)

    •	Apply the same sorting rules to SCSS and LESS files to maintain consistency across stylesheets.

## Why Use CSS Organizer?

    •	Save Time: No more manually sorting CSS properties.
    •	Improve Readability: Clean and structured code is easier to understand.
    •	Boost Collaboration: Ensure consistent styling across team projects.
    •	Follow Modern Conventions: Compatible with BEM, SMACSS, Atomic CSS, and other methodologies.

## How to Use

    1.	Install: Download CSS Organizer from the Visual Studio Code Marketplace.
    2.	Edit: Open a CSS file and make edits.
    3.	Save: Save the file with Cmd+S (Mac) or Ctrl+S (Windows/Linux).
    4.	Watch: The properties will be automatically sorted and formatted!

## Example Use Case

Before saving:

```css
.my-class {
  height: 100px;
  font-family: Arial;
  position: absolute;
  color: red;
}
```

After saving:

```css
.my-class {
  font-family: Arial;
  position: absolute;
  height: 100px;
  color: red;
}
```

## CSS Organizer

Keep your CSS clean, structured, and easy to maintain! 🎨
