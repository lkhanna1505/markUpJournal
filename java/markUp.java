import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class markUp {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String filePath = "D:\\Coding\\Project\\markUp_Journal\\journal.json";

        try {
            System.out.println("Welcome to markUp Journal!");
            System.out.print("Enter your journal entry: ");
            String journalEntry = scanner.nextLine();

            // 1. Append the user's string input to the JSON file
            try (PrintWriter out = new PrintWriter(new FileWriter(filePath, true))) {
                // For simplicity, we'll append each entry as a new line.
                // For proper JSON, you'd need to read the file, parse it, add the new entry,
                // and then rewrite.
                // This example assumes a simple line-by-line append, suitable for a log-like
                // journal.
                // If you need strict JSON array/object, the file handling logic needs to be
                // more complex.
                out.println(journalEntry);
                System.out.println("Journal entry saved to " + filePath);
            } catch (IOException e) {
                System.err.println("Error writing to journal file: " + e.getMessage());
                return; // Exit if file writing fails
            }

            // 2. Prepare the commit message with current date and time
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String formattedDateTime = now.format(formatter);
            String commitMessage = "Journal update: " + formattedDateTime;

            // 3. Execute Git commands
            System.out.println("\nExecuting Git commands...");

            // Command 1: git add .
            executeCommand(new String[] { "cmd.exe", "/c", "git add ." }, "D:\\Coding\\Project\\markUp_Journal");

            // Command 2: git commit -m "<message>"
            executeCommand(new String[] { "cmd.exe", "/c", "git commit -m \"" + commitMessage + "\"" },
                    "D:\\Coding\\Project\\markUp_Journal");

            // Command 3: git push origin main
            executeCommand(new String[] { "cmd.exe", "/c", "git push origin main" },
                    "D:\\Coding\\Project\\markUp_Journal");

            System.out.println("\nGit operations completed.");

        } catch (Exception e) {
            System.err.println("An unexpected error occurred: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace for debugging
        } finally {
            scanner.close();
        }
    }

    /**
     * Helper method to execute a command and print its output/errors.
     * 
     * @param command          The command array (e.g., {"cmd.exe", "/c", "git add
     *                         ."}).
     * @param workingDirectory The directory where the command should be executed.
     */
    private static void executeCommand(String[] command, String workingDirectory) {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(new java.io.File(workingDirectory));
        processBuilder.redirectErrorStream(true); // Redirect error stream to output stream

        try {
            Process process = processBuilder.start();
            System.out.println("Running command: " + String.join(" ", command));

            // Read and print output from the command
            try (Scanner commandOutput = new Scanner(process.getInputStream())) {
                while (commandOutput.hasNextLine()) {
                    System.out.println(commandOutput.nextLine());
                }
            }

            int exitCode = process.waitFor(); // Wait for the process to complete
            System.out.println("Command exited with code: " + exitCode);
            if (exitCode != 0) {
                System.err.println("Command failed: " + String.join(" ", command));
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("Error executing command '" + String.join(" ", command) + "': " + e.getMessage());
            Thread.currentThread().interrupt(); // Restore the interrupted status
        }
    }
}