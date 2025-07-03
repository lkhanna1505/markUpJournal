import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class markUp {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String journalFilePath = "D:\\Coding\\Project\\markUp_Journal\\journal.json";
        String repoPath = "D:\\Coding\\Project\\markUp_Journal"; // Root of your Git repository

        try {
            System.out.println("Welcome to markUp Journal!");
            System.out.print("Enter your journal entry: ");
            String journalEntry = scanner.nextLine();

            // 1. Handle JSON file manually: Read, Update, Write
            StringBuilder jsonContent = new StringBuilder();
            File journalFile = new File(journalFilePath);

            // Read existing content
            if (journalFile.exists() && journalFile.length() > 0) {
                try {
                    String existingContent = new String(Files.readAllBytes(Paths.get(journalFilePath)));
                    existingContent = existingContent.trim(); // Remove leading/trailing whitespace

                    // Check if it's a valid JSON array start/end
                    if (existingContent.startsWith("[") && existingContent.endsWith("]")) {
                        // Remove the trailing ']' and any preceding newline to append new data
                        jsonContent.append(existingContent.substring(0, existingContent.length() - 1));
                        // If there are existing entries, add a comma before the new entry
                        if (jsonContent.length() > 1) { // If it's not just "["
                            jsonContent.append(",");
                        }
                    } else {
                        System.err.println(
                                "Warning: Existing journal.json is not a valid JSON array. Starting with a new empty array.");
                        jsonContent.append("[");
                    }
                } catch (IOException e) {
                    System.err.println("Error reading existing journal file: " + e.getMessage());
                    jsonContent.append("["); // Start fresh if read fails
                }
            } else {
                jsonContent.append("["); // Start with an empty array if file doesn't exist or is empty
            }

            // Create a new JSON string for the entry
            LocalDateTime entryTime = LocalDateTime.now();
            DateTimeFormatter entryFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String timestamp = entryTime.format(entryFormatter);

            // Manually construct the JSON object string for the new entry
            // Escaping double quotes within the journalEntry if present
            String escapedJournalEntry = journalEntry.replace("\"", "\\\"");
            String newEntryJson = String.format("{\"timestamp\": \"%s\", \"entry\": \"%s\"}", timestamp,
                    escapedJournalEntry);

            // Append the new entry
            jsonContent.append(newEntryJson);

            // Close the JSON array
            jsonContent.append("]");

            // Write the entire updated JSON string back to the file (overwriting)
            try (FileWriter fileWriter = new FileWriter(journalFile)) {
                fileWriter.write(jsonContent.toString());
                System.out.println("Journal entry saved to " + journalFilePath);
            } catch (IOException e) {
                System.err.println("Error writing to journal file: " + e.getMessage());
                return; // Exit if file writing fails
            }

            // 2. Prepare the commit message with current date and time
            LocalDateTime now = LocalDateTime.now(); // Already in local system time
            DateTimeFormatter commitFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'IST'");
            String formattedDateTime = now.format(commitFormatter);
            String commitMessage = "Journal update on " + formattedDateTime;

            // 3. Execute Git commands
            System.out.println("\nExecuting Git commands...");

            // Command 1: git add .
            executeCommand(new String[] { "cmd.exe", "/c", "git add ." }, repoPath);

            // Command 2: git commit -m "<message>"
            // Ensure the commit message is properly quoted for the command line
            executeCommand(new String[] { "cmd.exe", "/c", "git commit -m \"" + commitMessage + "\"" }, repoPath);

            // Command 3: git push origin main
            executeCommand(new String[] { "cmd.exe", "/c", "git push origin main" }, repoPath);

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
        processBuilder.directory(new File(workingDirectory));
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