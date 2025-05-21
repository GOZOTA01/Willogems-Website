document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formStatus = document.getElementById('formStatus');
    const submitButton = e.target.querySelector('.submit-button');
    
    // Get form data
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: e.target.message.value
    };

    console.log('Sending form data:', formData);

    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Send the form data to the server using the current domain
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            formStatus.textContent = 'Message sent successfully!';
            formStatus.className = 'form-status success';
            e.target.reset();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        // Show error message
        formStatus.textContent = 'Error sending message. Please try again.';
        formStatus.className = 'form-status error';
        console.error('Error:', error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});